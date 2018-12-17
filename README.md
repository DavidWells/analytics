# Analytics

This is a pluggable analytics library designed to work with any third party analytics tool.

## Features

- [x] Pluggable via middleware. Bring your own third party tool
- [x] Works on client & server-side
- [ ] (WIP) In client, works offline. Queues events to send when connection resumes

##  Why

Companies frequently change their analytics requirements and add/remove services to their sites and applications. This can be a time consuming process integrating with N number of third party tools.

This library solves that.

##  Philosophy

> You should never be locked into a tool.

To add or remove an analytics provider simply remove it as middleware.

The provider integrations can be run independently of this library or plugged into other tools.

## Install

```bash
npm install analytics --save
```

## Usage

```js
import Analytics from 'analytics'
import googleAnalytics from 'analytics-plugin-ga'

const analytics = Analytics({
  app: 'my-app-name',
  version: 100,
  plugins: [
    googleAnalytics({
      trackingId: 'UA-121991291',
    })
  ]
})

// page tracking
analytics.page()
// event tracking
analytics.track('userPurchase', {
  price: 20
})
// identifying users
analytics.identify('user-id-xyz', {
  firstName: 'bill',
  lastName: 'murray',
  email: 'da-coolest@aol.com'
})
//...
```

## Demo

See [Analytics Demo](https://analytics-demo.netlify.com/) for a site example.

## API

<!-- AUTO-GENERATED-CONTENT:START (API_DOCS) -->
## identify

Identify user

### Arguments

- **userId** <code>String</code> - Unique ID of user
- **traits** <code>Object</code> - Object of user traits
- **options** <code>Object</code> - Options to pass to indentify call
- **callback** <code>Function</code> - Optional callback function after identify completes

```js
identify('xyz-123', {
   name: 'steve',
   company: 'hello-clicky'
 })
```

## track

Track an analytics event

### Arguments

- **eventName** <code>String</code> - Event name
- **payload** <code>Object</code> - Event payload
- **options** <code>Object</code> - Event options
- **callback** <code>Function</code> - Callback to fire after tracking completes

```js
analytics.track('buttonClick')
```

## page

Trigger page view

### Arguments

- **data** <code>String</code> - (optional) page data
- **options** <code>Object</code> - Event options
- **callback** <code>Function</code> - Callback to fire after page view call completes

```js
analytics.page()
```

## getState

getState helper with dotprop

### Arguments

- **key** <code>String</code> - (optional) dotprop sub value of state

```js
// Get the current state of analytics
analytics.getState()

// Get a subpath of state
analytics.getState('context.offline')
```

## reset

Clear all information about the visitor

### Arguments

- **callback** <code>Function</code> - Handler to run after reset


## dispatch

Emit events for other plugins to react to

### Arguments

- **action** <code>Object</code> [description]


## storage

Storage utilities for persisting data


## getItem

Get value from storage

### Arguments

- **key** <code>String</code> - storage key
- **options** <code>Object</code> - storage options

```js
analytics.storage.getItem('storage_key')
```

## setItem

Set storage value

### Arguments

- **key** <code>String</code> - storage key
- **value** <a href="Any.html">Any</a> - storage value
- **options** <code>Object</code> - storage options

```js
analytics.storage.setItem('storage_key', 'value')
```

## removeItem

Remove storage value

### Arguments

- **key** <code>String</code> - storage key
- **options** <code>Object</code> - storage options

```js
analytics.storage.removeItem('storage_key')
```

## setAnonymousId

Set the anonymous ID of the visitor

### Arguments

- **anonId** <code>String</code> - Id to set
- **options** <code>Object</code> - storage options


## user

Get user data

### Arguments

- **key** <code>String</code> - dot.prop subpath of user data

```js
// get all user data
const userData = analytics.user()

// get user company name
const companyName = analytics.user('company.name')
```

## ready

Fire callback on analytics ready event

### Arguments

- **callback** <code>Function</code> - function to trigger when all providers have loaded

```js
analytics.ready((action, instance) => {
  console.log('all integrations have loaded')
})
```

## on

Attach an event handler function for one or more events to the selected elements.

### Arguments

- **name** <code>String</code> - Name of event to listen to
- **callback** <code>Function</code> - function to fire on event

```js
analytics.on('track', (action, instance) => {
  console.log('track call just happened. Do stuff')
})
```

## once

Attach a handler function to an event and only trigger it only once.

### Arguments

- **name** <code>String</code> - Name of event to listen to
- **callback** <code>Function</code> - function to fire on event

```js
analytics.once('track', (action, instance) => {
  console.log('This will only triggered once')
})
```

## enablePlugin

Enable analytics plugin

### Arguments

- **name** <code>String</code>|<code>Array</code> - name of integration(s) to disable
- **callback** <code>Function</code> - callback after enable runs

```js
analytics.enablePlugin('google')

// enable multiple integrations at once
analytics.enablePlugin(['google', 'segment'])
```

## disablePlugin

Disable analytics plugin

### Arguments

- **name** <code>string</code>|<code>array</code> - name of integration(s) to disable
- **callback** <code>Function</code> - callback after disable runs

```js
analytics.disablePlugin('google')

analytics.disablePlugin(['google', 'segment'])
```

## loadPlugin

Load registered analytic providers.

### Arguments

- **namespace** <code>String</code> - integration namespace

```js
analytics.loadPlugin('segment')
```

## EVENTS

Expose available events for third party plugins & listeners


## CONSTANTS

Expose available constants for third party plugins & listeners
<!-- AUTO-GENERATED-CONTENT:END -->

## Current plugins

- [Google Analytics](https://www.npmjs.com/package/analytics-plugin-ga)
- [Customer.io](https://www.npmjs.com/package/analytics-plugin-customerio)
- Add yours! 👇

##  Adding Analytics providers plugins

The library is designed to work with any third party analytics tool.

Here is an example:

```js
export default function googleAnalytics(config) {
  return {
    NAMESPACE: 'google-analytics',
    config: {
      whatever: 'youWant',
      googleAnalyticsId: config.id // 'UA-82833-33833'
    },
    initialize: function() {
      // load provider script to page (in browser)
    },
    page: function() {
      // call provider specific page tracking
    },
    track: function() {
      // call provider specific event tracking
    },
    identify: function() {
      // call provider specific user identify method
    },
    loaded: () => {
      // return boolean for loaded analytics library
      return !!window.gaplugins
    }
  }
}
```

Alternatively, you can also add whatever middleware functionality you'd like via redux middleware.

```js
// logger example
const logger = store => next => action => {
  if (action.type) {
    console.log(`>> dispatching ${action.type}`, JSON.stringify(action))
  }
  let result = next(action)

  return result
}

export default logger
```

##  Plugin naming conventions

Plugins should follow a naming convention like so:

`analytics-plugin-{your-plugin-name}`
