# Analytics 📊

A lightweight, extendable analytics library designed to work with **any** third party analytics provider to track page views, custom events, & identify users.

The `analytics` library allows users to:

- Connect with your favorite analytics providers
- Trigger custom logic based on user activity
- Extend with functionality via [plugins](#analytic-plugins)
- Easily allow visitors to opt out of tracking
- [... and lots more](#features)

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
  * [Configuration](#configuration)
  * [analytics.identify](#analyticsidentify)
  * [analytics.track](#analyticstrack)
  * [analytics.page](#analyticspage)
  * [analytics.user](#analyticsuser)
  * [analytics.reset](#analyticsreset)
  * [analytics.ready](#analyticsready)
  * [analytics.on](#analyticson)
  * [analytics.once](#analyticsonce)
  * [analytics.getState](#analyticsgetstate)
  * [analytics.enablePlugin](#analyticsenableplugin)
  * [analytics.disablePlugin](#analyticsdisableplugin)
  * [analytics.storage](#analyticsstorage)
  * [analytics.storage.getItem](#analyticsstoragegetitem)
  * [analytics.storage.setItem](#analyticsstoragesetitem)
  * [analytics.storage.removeItem](#analyticsstorageremoveitem)
- [Analytic plugins](#analytic-plugins)
- [Creating analytics plugins](#creating-analytics-plugins)
  * [React to any event](#react-to-any-event)
  * [Optional - Using middleware](#optional---using-middleware)
  * [Opt out example plugin](#opt-out-example-plugin)
- [Plugin Naming Conventions](#plugin-naming-conventions)
- [Contributing](#contributing)

</details>
<!-- AUTO-GENERATED-CONTENT:END -->

## Features

- [x] [Extendable](#analytic-plugins) - Bring your own third party tool & plugins
- [x] Test & Debug analytics integrations with time travel & offline mode.
- [x] Exposes lifecycle for analytic calls allowing for per event cancellation or provider specific payloads
- [x] Works on client & server-side
- [x] Queues events to send when analytic libraries are loaded
- [ ] (WIP) works offline

##  Why

Companies frequently change analytics & collection requirements. This results in adding & removing analytic services a painful time consuming process.

This library aims to solves that with a simple pluggable abstraction layer.

##  Philosophy

> You should never be locked into a tool

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

/* Initialize analytics */
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

/* Track a page view */
analytics.page()

/* Track a custom event */
analytics.track('userPurchase', {
  price: 20
  item: 'pink socks'
})

/* Identify a visitor */
analytics.identify('user-id-xyz', {
  firstName: 'bill',
  lastName: 'murray',
  email: 'da-coolest@aol.com'
})
```

<details>
  <summary>Node.js usage</summary>

  ```js
  const { analytics } = require('analytics')
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
  ```

</details>

<details>
  <summary>Browser usage</summary>

  ```html
  <script src="https://unpkg.com/analytics/dist/analytics.min.js"></script>
  <script>
    const Analytics = analytics({
      app: 'my-app-name',
      version: 100,
      ...plugins
    })

    Analytics.track()

    // optionally expose to window
    window.Analytics = Analytics
  </script>
  ```

</details>

## Demo

See [Analytics Demo](https://analytics-demo.netlify.com/) for a site example.

## API

Below is the core API analytics expose once initialized.

<!-- AUTO-GENERATED-CONTENT:START (API_DOCS) -->
### Configuration

Analytics library

**Arguments**

- **config** <code>object</code> - analytics core config
- **[config.app]** (optional) <code>string</code> - Name of site / app
- **[config.version]** (optional) <code>string</code> - Version of your app
- **[config.plugins]** (optional) <code>array</code> - Array of analytics plugins

**Example**

```js
import Analytics from 'analytics'

// initialize analytics
const analytics = Analytics({
  app: 'my-awesome-app',
  plugins: [
    ...importedPlugins
  ]
})
```

### analytics.identify

Identify a user. This will trigger `identify` calls in any installed plugins and will set user data in localStorage

**Arguments**

- **userId** <code>String</code> - Unique ID of user
- **[traits]** (optional) <code>Object</code> - Object of user traits
- **[options]** (optional) <code>Object</code> - Options to pass to identify call
- **[callback]** (optional) <code>Function</code> - Callback function after identify completes

**Example**

```js
// Basic user id identify
analytics.identify('xyz-123')

// Identify with additional traits
analytics.identify('xyz-123', {
  name: 'steve',
  company: 'hello-clicky'
})

// Disable identify for specific plugin
analytics.identify('xyz-123', {}, {
 plugins: {
   // disable for segment plugin
   segment: false
 }
})

// Fire callback with 2nd or 3rd argument
analytics.identify('xyz-123', () => {
  console.log('do this after identify')
})
```

### analytics.track

Track an analytics event. This will trigger `track` calls in any installed plugins

**Arguments**

- **eventName** <code>String</code> - Event name
- **[payload]** (optional) <code>Object</code> - Event payload
- **[options]** (optional) <code>Object</code> - Event options
- **[callback]** (optional) <code>Function</code> - Callback to fire after tracking completes

**Example**

```js
// Basic event tracking
analytics.track('buttonClicked')

// Event tracking with payload
analytics.track('itemPurchased', {
  price: 11,
  sku: '1234'
})

// Disable specific plugin on track
analytics.track('cartAbandoned', {
  items: ['xyz', 'abc']
}, {
 plugins: {
   // disable track event for segment
   segment: false
 }
})

// Fire callback with 2nd or 3rd argument
analytics.track('newsletterSubscribed', () => {
  console.log('do this after track')
})
```

### analytics.page

Trigger page view. This will trigger `page` calls in any installed plugins

**Arguments**

- **[data]** (optional) <code>String</code> - Page data overrides.
- **[options]** (optional) <code>Object</code> - Page tracking options
- **[callback]** (optional) <code>Function</code> - Callback to fire after page view call completes

**Example**

```js
// Basic page tracking
analytics.page()

// Page tracking with page data overides
analytics.page({
  url: 'https://google.com'
})

// Disable specific plugin page tracking
analytics.page({}, {
 plugins: {
   // disable page tracking event for segment
   segment: false
 }
})

// Fire callback with 1st, 2nd or 3rd argument
analytics.page(() => {
  console.log('do this after page')
})
```

### analytics.user

Get user data

**Arguments**

- **[key]** (optional) <code>String</code> - dot.prop.path of user data. Example: 'traits.company.name'

**Example**

```js
// Get all user data
const userData = analytics.user()

// Get user id
const userId = analytics.user('userId')

// Get user company name
const companyName = analytics.user('traits.company.name')
```

### analytics.reset

Clear all information about the visitor & reset analytic state.

**Arguments**

- **[callback]** (optional) <code>Function</code> - Handler to run after reset

**Example**

```js
// Reset current visitor
analytics.reset()
```

### analytics.ready

Fire callback on analytics ready event

**Arguments**

- **callback** <code>Function</code> - function to trigger when all providers have loaded

**Example**

```js
analytics.ready() => {
  console.log('all plugins have loaded or were skipped', payload)
})
```

### analytics.on

Attach an event handler function for one or more events to the selected elements.

**Arguments**

- **name** <code>String</code> - Name of event to listen to
- **callback** <code>Function</code> - function to fire on event

**Example**

```js
// Fire function when 'track' calls happen
analytics.on('track', ({ payload }) => {
  console.log('track call just happened. Do stuff')
})

// Remove listener before it is called
const removeListener = analytics.on('track', ({ payload }) => {
  console.log('This will never get called')
})
removeListener() // cleanup .on listener
```

### analytics.once

Attach a handler function to an event and only trigger it only once.

**Arguments**

- **name** <code>String</code> - Name of event to listen to
- **callback** <code>Function</code> - function to fire on event

**Example**

```js
// Fire function only once 'track'
analytics.once('track', ({ payload }) => {
  console.log('This will only triggered once')
})

// Remove listener before it is called
const removeOnce = analytics.once('track', ({ payload }) => {
  console.log('This will never get called')
})
removeOnce() // cleanup once function
```

### analytics.getState

Get data about user, activity, or context. Access sub-keys of state with `dot.prop` syntax.

**Arguments**

- **[key]** (optional) <code>string</code> - dot.prop.path value of state

**Example**

```js
// Get the current state of analytics
analytics.getState()

// Get a subpath of state
analytics.getState('context.offline')
```

### analytics.enablePlugin

Enable analytics plugin

**Arguments**

- **plugins** <code>String</code>|<code>Array</code> - name of plugins(s) to disable
- **[callback]** (optional) <code>Function</code> - callback after enable runs

**Example**

```js
analytics.enablePlugin('google')

// Enable multiple plugins at once
analytics.enablePlugin(['google', 'segment'])
```

### analytics.disablePlugin

Disable analytics plugin

**Arguments**

- **name** <code>String</code>|<code>Array</code> - name of integration(s) to disable
- **callback** <code>Function</code> - callback after disable runs

**Example**

```js
analytics.disablePlugin('google')

analytics.disablePlugin(['google', 'segment'])
```

### analytics.storage

Storage utilities for persisting data.
These methods will allow you to save data in localStorage, cookies, or to the window.

**Example**

```js
// Pull storage off analytics instance
const { storage } = analytics

// Get value
storage.getItem('storage_key')

// Set value
storage.setItem('storage_key', 'value')

// Remove value
storage.removeItem('storage_key')
```

### analytics.storage.getItem

Get value from storage

**Arguments**

- **key** <code>String</code> - storage key
- **[options]** (optional) <code>Object</code> - storage options

**Example**

```js
analytics.storage.getItem('storage_key')
```

### analytics.storage.setItem

Set storage value

**Arguments**

- **key** <code>String</code> - storage key
- **value** <a href="any.html">any</a> - storage value
- **[options]** (optional) <code>Object</code> - storage options

**Example**

```js
analytics.storage.setItem('storage_key', 'value')
```

### analytics.storage.removeItem

Remove storage value

**Arguments**

- **key** <code>String</code> - storage key
- **[options]** (optional) <code>Object</code> - storage options

**Example**

```js
analytics.storage.removeItem('storage_key')
```
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
- [analytics-plugin-segment](https://github.com/DavidWells/analytics/tree/master/packages/analytics-plugin-segment) Segment integration for 'analytics' module for browser & node [npm link](https://www.npmjs.com/package/analytics-plugin-segment).
- [analytics-plugin-tab-events](https://github.com/DavidWells/analytics/tree/master/packages/analytics-plugin-tab-events) Expose tab visibility events for analytics [npm link](https://www.npmjs.com/package/analytics-plugin-tab-events).
- [analytics-plugin-window-events](https://github.com/DavidWells/analytics/tree/master/packages/analytics-plugin-window-events) Expose window events for analytics [npm link](https://www.npmjs.com/package/analytics-plugin-window-events).
- [analytics-utils](https://github.com/DavidWells/analytics/tree/master/packages/analytics-utils) Analytics utility functions [npm link](https://www.npmjs.com/package/analytics-utils).
- [gatsby-plugin-analytics](https://github.com/DavidWells/analytics/tree/master/packages/gatsby-plugin-analytics) Easily add analytics to your Gatsby site. [npm link](https://www.npmjs.com/package/gatsby-plugin-analytics).
- [analytics-plugin-template](https://github.com/DavidWells/analytics/tree/master/packages/plugin-template) Example plugin with browser + node module build with treeshaking [npm link](https://www.npmjs.com/package/analytics-plugin-template).
- Add yours! 👇
<!-- AUTO-GENERATED-CONTENT:END -->

## Creating analytics plugins

The library is designed to work with any third party analytics tool.

Plugins are just plain javascript objects that expose methods for `analytics` to register and call.

Here is a quick example of a plugin:

```js
// plugin-example.js
export default function pluginExample(userConfig) {
  // return object for analytics to use
  return {
    /* All plugins require a NAMESPACE */
    NAMESPACE: 'my-example-plugin',
    /* Everything else below this is optional depending on your plugin requirements */
    config: {
      whatEver: userConfig.whatEver,
      elseYouNeed: userConfig.elseYouNeed
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
      return !!window.myPluginLoaded
    }
  }
}
```

`NAMESPACE` is required for all plugins. All other methods are optional.

If you don't need to hook into `page` tracking, just omit the `page` key from your plugin object.

To use a plugin, import it and pass it into the `plugins` array when you bootstrap `analytics`.

```js
import Analytics from 'analytics'
import pluginExample from './plugin-example.js'

const analytics = Analytics({
  app: 'my-app-name',
  plugins: [
    pluginExample({
      whatEver: 'hello',
      elseYouNeed: 'there'
    }),
    ...otherPlugins
  ]
})
```

### React to any event

Plugins can react to any event flowing through the `analytics` library.

For example, if you wanted to trigger custom logic when `analytics` bootstraps you can attach a function handler to the `bootstrap` event.

For a full list of core events, checkout [`events.js`](https://github.com/DavidWells/analytics/blob/master/packages/analytics-core/events.js).

```js
// Example Plugin plugin.js
export default function myPlugin(userConfig) {
  return {
    NAMESPACE: 'my-plugin',
    bootstrap: ({ payload, config, instance }) => {
      // Do whatever on `bootstrap` event
    },
    pageStart: ({ payload, config, instance }) => {
      // Fire custom logic before analytics.page() calls
    },
    pageEnd: ({ payload, config, instance }) => {
      // Fire custom logic after analytics.page() calls
    },
    trackStart: ({ payload, config, instance }) => {
      // Fire custom logic before analytics.track() calls
    },
    'track:customerio': ({ payload, config, instance }) => {
      // Fire custom logic before customer.io plugin runs.
      // Here you can customize the data sent to individual analytics providers
    },
    trackEnd: ({ payload, config, instance }) => {
      // Fire custom logic after analytics.track() calls
    },
    // ... hook into other events
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
    // include myPlugin
    myPlugin(),
    customerIoPlugin({
      trackingId: '1234'
    })
    ...otherPlugins
  ]
})
```

### Optional - Using middleware

Alternatively, you can also attach any middleware functionality you'd like from the `redux` ecosystem.

```js
// logger-plugin.js redux middleware
const logger = store => next => action => {
  if (action.type) {
    console.log(`>> analytics dispatching ${action.type}`, JSON.stringify(action))
  }
  return next(action)
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

Plugins should follow this naming convention before being published to npm

```
analytics-plugin-{your-plugin-name}
```

E.g. An analytics plugin that does `awesome-stuff` should be named

```
npm install analytics-plugin-awesome-stuff
```

# Contributing

Contributions are always welcome, no matter how large or small. Before contributing,
please read the [code of conduct](CODE_OF_CONDUCT.md).
