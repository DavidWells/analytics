# Analytics

A pluggable analytics library designed to work with any third party analytics tool.

Connect with your favorite analytic providers, trigger custom logic based on user activity, or easily provide opt out mechanisms for visitors who wish to turn off analytics entirely.

## Table of Contents
<!-- AUTO-GENERATED-CONTENT:START (TOC:collapse=true&collapseText=Click to expand) -->
<details>
<summary>Click to expand</summary>

- [Features](#features)
- [Why](#why)
- [Philosophy](#philosophy)
- [Install](#install)
- [Usage](#usage)
- [Demo](#demo)
- [API](#api)
  * [analytics.identify](#analyticsidentify)
  * [analytics.track](#analyticstrack)
  * [analytics.page](#analyticspage)
  * [analytics.getState](#analyticsgetstate)
  * [analytics.reset](#analyticsreset)
  * [analytics.dispatch](#analyticsdispatch)
  * [analytics.storage](#analyticsstorage)
  * [analytics.storage.getItem](#analyticsstoragegetitem)
  * [analytics.storage.setItem](#analyticsstoragesetitem)
  * [analytics.storage.removeItem](#analyticsstorageremoveitem)
  * [analytics.user](#analyticsuser)
  * [analytics.ready](#analyticsready)
  * [analytics.on](#analyticson)
  * [analytics.once](#analyticsonce)
  * [analytics.enablePlugin](#analyticsenableplugin)
  * [analytics.disablePlugin](#analyticsdisableplugin)
  * [analytics.loadPlugin](#analyticsloadplugin)
  * [analytics.events](#analyticsevents)
- [Analytic plugins](#analytic-plugins)
- [Creating analytics plugins](#creating-analytics-plugins)
  * [React to any event](#react-to-any-event)
  * [(optionally) Use middleware](#optionally-use-middleware)
  * [Opt out example plugin](#opt-out-example-plugin)
- [Plugin Naming Conventions](#plugin-naming-conventions)
- [CONTRIBUTING](#contributing)

</details>
<!-- AUTO-GENERATED-CONTENT:END -->

## Features

- [x] [Pluggable](#analytic-plugins) - Bring your own third party tool
- [x] Test & Debug analytics integrations with time travel & offline mode.
- [x] Exposes lifecycle for analytic calls allowing for per event cancellation or provider specific payloads
- [x] Works on client & server-side
- [ ] (WIP) In client, works offline. Queues events to send when connection resumes

##  Why

Companies frequently change analytics & collection requirements. This results in adding & removing analytic services a painful time consuming process.

This library aims to solves that with a simple abstraction layer.

##  Philosophy

> You should never be locked into a tool.

To add or remove an analytics provider adjust the `plugins` you load into `analytics`.

## Install

```bash
npm install analytics --save
```

Or as a script tag:

```html
<script src="https://unpkg.com/analytics/dist/analytics.min.js"></script>
```

## Usage

```js
import Analytics from 'analytics'
import googleAnalyticsPlugin from 'analytics-plugin-ga'
import customerIOPlugin from 'analytics-plugin-customerio'

const analytics = Analytics({
  app: 'my-app-name',
  version: 100,
  plugins: [
    googleAnalyticsPlugin({
      trackingId: 'UA-121991291',
    }),
    customerIOPlugin({
      siteId: '123-xyz'
    })
  ]
})

// Fire a page view
analytics.page()
// Fire event tracking
analytics.track('userPurchase', {
  price: 20
})
// Identify a visitor
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

Below is the core API analytics expose once initialized.

<!-- AUTO-GENERATED-CONTENT:START (API_DOCS) -->
### analytics.identify

Identify a user. This will trigger `identify` calls in any installed plugins and will set user data in localStorage

**Arguments**

- **userId** <code>String</code> - Unique ID of user
- **traits** <code>Object</code> - Object of user traits
- **options** <code>Object</code> - Options to pass to indentify call
- **callback** <code>Function</code> - Optional callback function after identify completes

**Example**

```js
identify('xyz-123', {
  name: 'steve',
  company: 'hello-clicky'
})
```

### analytics.track

Track an analytics event. This will trigger `track` calls in any installed plugins

**Arguments**

- **eventName** <code>String</code> - Event name
- **payload** <code>Object</code> - Event payload
- **options** <code>Object</code> - Event options
- **callback** <code>Function</code> - Callback to fire after tracking completes

**Example**

```js
analytics.track('buttonClick')
```

### analytics.page

Trigger page view. This will trigger `page` calls in any installed plugins

**Arguments**

- **data** <code>String</code> - (optional) page data
- **options** <code>Object</code> - Event options
- **callback** <code>Function</code> - Callback to fire after page view call completes

**Example**

```js
analytics.page()
```

### analytics.getState

Get data about user, activity, or context. You can access sub-keys of state with `dot.prop` syntax.

**Arguments**

- **key** <code>String</code> - (optional) dotprop sub value of state

**Example**

```js
// Get the current state of analytics
analytics.getState()

// Get a subpath of state
analytics.getState('context.offline')
```

### analytics.reset

Clear all information about the visitor & reset analytic state.

**Arguments**

- **callback** <code>Function</code> - Handler to run after reset


### analytics.dispatch

Emit events for other plugins or middleware to react to.

**Arguments**

- **action** <code>Object</code> [description]


### analytics.storage

Storage utilities for persisting data. These methods will allow you to save data in localStorage, cookies, or to the window.


### analytics.storage.getItem

Get value from storage

**Arguments**

- **key** <code>String</code> - storage key
- **options** <code>Object</code> - storage options

**Example**

```js
analytics.storage.getItem('storage_key')
```

### analytics.storage.setItem

Set storage value

**Arguments**

- **key** <code>String</code> - storage key
- **value** <a href="Any.html">Any</a> - storage value
- **options** <code>Object</code> - storage options

**Example**

```js
analytics.storage.setItem('storage_key', 'value')
```

### analytics.storage.removeItem

Remove storage value

**Arguments**

- **key** <code>String</code> - storage key
- **options** <code>Object</code> - storage options

**Example**

```js
analytics.storage.removeItem('storage_key')
```

### analytics.user

Get user data

**Arguments**

- **key** <code>String</code> - dot.prop subpath of user data

**Example**

```js
// get all user data
const userData = analytics.user()

// get user company name
const companyName = analytics.user('company.name')
```

### analytics.ready

Fire callback on analytics ready event

**Arguments**

- **callback** <code>Function</code> - function to trigger when all providers have loaded

**Example**

```js
analytics.ready((action, instance) => {
  console.log('all plugins have loaded')
})
```

### analytics.on

Attach an event handler function for one or more events to the selected elements.

**Arguments**

- **name** <code>String</code> - Name of event to listen to
- **callback** <code>Function</code> - function to fire on event

**Example**

```js
analytics.on('track', ({ action, instance }) => {
  console.log('track call just happened. Do stuff')
})
```

### analytics.once

Attach a handler function to an event and only trigger it only once.

**Arguments**

- **name** <code>String</code> - Name of event to listen to
- **callback** <code>Function</code> - function to fire on event

**Example**

```js
analytics.once('track', (action, instance) => {
  console.log('This will only triggered once')
})
```

### analytics.enablePlugin

Enable analytics plugin

**Arguments**

- **name** <code>String</code>|<code>Array</code> - name of integration(s) to disable
- **callback** <code>Function</code> - callback after enable runs

**Example**

```js
analytics.enablePlugin('google')

// enable multiple plugins at once
analytics.enablePlugin(['google', 'segment'])
```

### analytics.disablePlugin

Disable analytics plugin

**Arguments**

- **name** <code>string</code>|<code>array</code> - name of integration(s) to disable
- **callback** <code>Function</code> - callback after disable runs

**Example**

```js
analytics.disablePlugin('google')

analytics.disablePlugin(['google', 'segment'])
```

### analytics.loadPlugin

Load registered analytic providers.

**Arguments**

- **namespace** <code>String</code> - integration namespace

**Example**

```js
analytics.loadPlugin('segment')
```

### analytics.events

Events exposed by core analytics library and all loaded plugins
<!-- AUTO-GENERATED-CONTENT:END -->

## Analytic plugins

The `analytics` has a robust plugin system. Here is a list of currently available plugins:

<!-- AUTO-GENERATED-CONTENT:START (PLUGINS) -->
- [analytics-plugin-customerio](https://github.com/DavidWells/analytics/tree/master/packages/analytics-plugin-customerio) Customer.io plugin for 'analytics' [npm link](https://www.npmjs.com/package/analytics-plugin-customerio).
- [analytics-plugin-do-not-track](https://github.com/DavidWells/analytics/tree/master/packages/analytics-plugin-do-not-track) Disable tracking for opted out visitors [npm link](https://www.npmjs.com/package/analytics-plugin-do-not-track).
- [analytics-plugin-ga](https://github.com/DavidWells/analytics/tree/master/packages/analytics-plugin-ga) Google analytics integration for 'analytics' pkg [npm link](https://www.npmjs.com/package/analytics-plugin-ga).
- [analytics-plugin-google-tag-manager](https://github.com/DavidWells/analytics/tree/master/packages/analytics-plugin-google-tag-manager) Google tag manager plugin for 'analytics' pkg [npm link](https://www.npmjs.com/package/analytics-plugin-google-tag-manager).
- [analytics-plugin-lifecycle-example](https://github.com/DavidWells/analytics/tree/master/packages/analytics-plugin-lifecycle-example) Example plugin with lifecycle methods [npm link](https://www.npmjs.com/package/analytics-plugin-lifecycle-example).
- [analytics-plugin-original-source](https://github.com/DavidWells/analytics/tree/master/packages/analytics-plugin-original-source) Save original referral source of visitor [npm link](https://www.npmjs.com/package/analytics-plugin-original-source).
- [analytics-plugin-segment](https://github.com/DavidWells/analytics/tree/master/packages/analytics-plugin-segment) Segment integration for 'analytics' pkg [npm link](https://www.npmjs.com/package/analytics-plugin-segment).
- [analytics-plugin-tab-events](https://github.com/DavidWells/analytics/tree/master/packages/analytics-plugin-tab-events) Expose tab visibility events for analytics [npm link](https://www.npmjs.com/package/analytics-plugin-tab-events).
- [analytics-plugin-window-events](https://github.com/DavidWells/analytics/tree/master/packages/analytics-plugin-window-events) Expose window events for analytics [npm link](https://www.npmjs.com/package/analytics-plugin-window-events).
- [analytics-utils](https://github.com/DavidWells/analytics/tree/master/packages/analytics-utils) Analytics utility functions [npm link](https://www.npmjs.com/package/analytics-utils).
- Add yours! 👇
<!-- AUTO-GENERATED-CONTENT:END -->

## Creating analytics plugins

The library is designed to work with any third party analytics tool.

Plugins are just plain javascript objects that expose methods for `analytics` core to register and call.

Here is a quick example of a plugin. This is a 'vanilla' plugin example for connecting a third party analytics tool

```js
// vanilla-example.js
export default function googleAnalytics(userConfig) {
  // return object for analytics to use
  return {
    // All plugins require a namespace
    NAMESPACE: 'google-analytics',
    config: {
      whatEver: userConfig.fooBar,
      googleAnalyticsId: userConfig.id
    },
    initialize: ({ config }) => {
      // load provider script to page
    },
    page: ({ payload }) => {
      // call provider specific page tracking
    },
    track: ({ payload }) => {
      // call provider specific event tracking
    },
    identify: ({ payload }) => {
      // call provider specific user identify method
    },
    loaded: () => {
      // return boolean so analytics knows when it can send data to third party
      return !!window.gaplugins
    }
  }
}
```

To use a plugin, import it and pass it into the `plugins` array when you bootstrap `analytics`.

```js
import Analytics from 'analytics'
import vanillaExample from './vanilla-example.js'

const analytics = Analytics({
  app: 'my-app-name',
  plugins: [
    vanillaExample({ id: 'xyz-123' }),
    ...otherPlugins
  ]
})
```

### React to any event

Plugins can react to any event flowing through `analytics`.

For example, if you wanted to trigger custom logic when `analytics` bootstraps you can attach a function handler to the `bootstrap` event.

For a full list of core events, checkout [`events.js`](https://github.com/DavidWells/analytics/blob/master/packages/analytics-core/events.js).

```js
// plugin.js
export default function myPlugin(userConfig) {
  return {
    NAMESPACE: 'my-plugin',
    bootstrap: ({ payload, config, instance }) => {
      // Do whatever on `bootstrap`
    },
    pageStart: ({ payload, config, instance }) => {
      // Fire custom logic before .page calls
    },
    pageEnd: ({ payload, config, instance }) => {
      // Fire custom logic after .page calls
    },
    trackStart: ({ payload, config, instance }) => {
      // Fire custom logic before .track calls
    },
    'track:customerio': ({ payload, config, instance }) => {
      // Fire custom logic before customer.io plugin runs.
      // Here you can customize the data sent to individual analytics providers
    },
    trackEnd: ({ payload, config, instance }) => {
      // Fire custom logic after .track calls
    },
    ...
  }
}
```

Using this plugin is the same as any other.

```js
import Analytics from 'analytics'
import customerIoPlugin from 'analytics-plugin-customerio'
import myPlugin from './plugin.js'

const analytics = Analytics({
  app: 'my-app-name',
  plugins: [
    myPlugin(),
    customerIoPlugin({
      trackingId: '1234'
    })
    ...otherPlugins
  ]
})
```

### (optionally) Use middleware

Alternatively, you can also add whatever middleware functionality you'd like from the `redux` ecosystem.

```js
// logger-plugin.js redux middleware
const logger = store => next => action => {
  if (action.type) {
    console.log(`>> dispatching ${action.type}`, JSON.stringify(action))
  }
  let result = next(action)

  return result
}

export default logger
```

Using this plugin is the same as any other.

```js
import Analytics from 'analytics'
import loggerPlugin from './logger-plugin.js'

const analytics = Analytics({
  app: 'my-app-name',
  plugins: [
    ...otherPlugins,
    loggerPlugin
  ]
})
```

### Opt out example plugin

This is a vanilla redux middleware that will opt out users from tracking. There are **many** ways to implement this type of functionality using `analytics`

```js
const optOutMiddleware = store => next => action => {
  const { type } = action
  if (type === 'trackStart' || type === 'pageStart' || type === 'trackStart') {
    // Check cookie/localStorage/Whatever to see if visitor opts out

    // Here I am checking user traits persisted to localStorage
    const { user } = store.getState()

    // user has optOut trait cancel action
    if (user && user.traits.optOut) {
      return next({
        ...action,
        ...{
          abort: true,
          reason: 'User opted out'
        },
      })
    }
  }
  return next(finalAction)
}

export default optOutMiddleware
```

##  Plugin Naming Conventions

Plugins should follow a naming convention before being published to NPM

```
analytics-plugin-{your-plugin-name}

npm install analytics-plugin-awesome-thing
```

# CONTRIBUTING

Contributions are always welcome, no matter how large or small. Before contributing,
please read the [code of conduct](CODE_OF_CONDUCT.md).
