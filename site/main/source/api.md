---
title: Analytics API Reference Documentation
description: The core analytics API docs for the open-source analytics module
pageTitle: API Reference
subTitle: Core analytics API
---

The core `analytics` API is exposed once the library is initialized with [configuration](#configuration).

> TLDR; read the [getting started guide](http://getanalytics.io/tutorials/getting-started/)

**Using analytics**

1. Initialize analytics with [configuration](#configuration)
2. Export the analytics instance with third-party providers (Google Analytics, HubSpot, etc.)
3. Use [`page`](#analyticspage), [`identify`](#analyticsidentify), [`track`](#analyticstrack) in your app
4. [Add an analytics provider](http://getanalytics.io/tutorials/getting-started/#3-connect-plugins)
5. [Write custom plugins](http://getanalytics.io/plugins/writing-plugins)

<!-- AUTO-GENERATED-CONTENT:START (API_DOCS) -->
## Configuration

Analytics library configuration

After the library is initialized with config, the core API is exposed & ready for use in the application.

**Arguments**

- **config** <code>object</code> - analytics core config
- **[config.app]** (optional) <code>string</code> - Name of site / app
- **[config.version]** (optional) <code>string</code> - Version of your app
- **[config.debug]** (optional) <code>boolean</code> - Should analytics run in debug mode
- **[config.plugins]** (optional) <code>Array</code>.&lt;<code>Object</code>&gt; - Array of analytics plugins

**Example**

```js{8-11}
import Analytics from 'analytics'
import pluginABC from 'analytics-plugin-abc'
import pluginXYZ from 'analytics-plugin-xyz'

// initialize analytics
const analytics = Analytics({
  app: 'my-awesome-app',
  plugins: [
    pluginABC,
    pluginXYZ
  ]
})
```

## `analytics.identify`

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

// Fire callback with 2nd or 3rd argument
analytics.identify('xyz-123', () => {
  console.log('do this after identify')
})

// Disable sending user data to specific analytic tools
analytics.identify('xyz-123', {}, {
  plugins: {
    // disable sending this identify call to segment
    segment: false
  }
})

// Send user data to only to specific analytic tools
analytics.identify('xyz-123', {}, {
  plugins: {
    // disable this specific identify in all plugins except customerio
    all: false,
    customerio: true
  }
})
```

## `analytics.track`

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

// Fire callback with 2nd or 3rd argument
analytics.track('newsletterSubscribed', () => {
  console.log('do this after track')
})

// Disable sending this event to specific analytic tools
analytics.track('cartAbandoned', {
  items: ['xyz', 'abc']
}, {
  plugins: {
    // disable track event for segment
    segment: false
  }
})

// Send event to only to specific analytic tools
analytics.track('customerIoOnlyEventExample', {
  price: 11,
  sku: '1234'
}, {
  plugins: {
    // disable this specific track call all plugins except customerio
    all: false,
    customerio: true
  }
})
```

## `analytics.page`

Trigger page view. This will trigger `page` calls in any installed plugins

**Arguments**

- **[data]** (optional) <a href="https://github.com/DavidWells/analytics/blob/master/packages/analytics-core/src/modules/page.js#L33">PageData</a> - Page data overrides.
- **[options]** (optional) <code>Object</code> - Page tracking options
- **[callback]** (optional) <code>Function</code> - Callback to fire after page view call completes

**Example**

```js
// Basic page tracking
analytics.page()

// Page tracking with page data overrides
analytics.page({
  url: 'https://google.com'
})

// Fire callback with 1st, 2nd or 3rd argument
analytics.page(() => {
  console.log('do this after page')
})

// Disable sending this pageview to specific analytic tools
analytics.page({}, {
  plugins: {
    // disable page tracking event for segment
    segment: false
  }
})

// Send pageview to only to specific analytic tools
analytics.page({}, {
  plugins: {
    // disable this specific page in all plugins except customerio
    all: false,
    customerio: true
  }
})
```

## `analytics.user`

Get user data

**Arguments**

- **[key]** (optional) <code>string</code> - dot.prop.path of user data. Example: 'traits.company.name'

**Example**

```js
// Get all user data
const userData = analytics.user()

// Get user id
const userId = analytics.user('userId')

// Get user company name
const companyName = analytics.user('traits.company.name')
```

## `analytics.reset`

Clear all information about the visitor & reset analytic state.

**Arguments**

- **[callback]** (optional) <code>Function</code> - Handler to run after reset

**Example**

```js
// Reset current visitor
analytics.reset()
```

## `analytics.ready`

Fire callback on analytics ready event

**Arguments**

- **callback** <code>Function</code> - function to trigger when all providers have loaded

**Example**

```js
analytics.ready() => {
  console.log('all plugins have loaded or were skipped', payload)
})
```

## `analytics.on`

Attach an event handler function for analytics lifecycle events.

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

// cleanup .on listener
removeListener()
```
`
## `analytics.once`

Attach a handler function to an event and only trigger it only once.

**Arguments**

- **name** <code>String</code> - Name of event to listen to
- **callback** <code>Function</code> - function to fire on event

**Example**

```js
// Fire function only once 'track'
analytics.once('track', ({ payload }) => {
  console.log('This will only triggered once when analytics.track() fires')
})

// Remove listener before it is called
const listener = analytics.once('track', ({ payload }) => {
  console.log('This will never get called b/c listener() is called')
})

// cleanup .once listener before it fires
listener()
```

## `analytics.getState`

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

## `analytics.storage`

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

### `analytics.storage.getItem`

Get value from storage

**Arguments**

- **key** <code>String</code> - storage key
- **[options]** (optional) <code>Object</code> - storage options

**Example**

```js
analytics.storage.getItem('storage_key')
```

### `analytics.storage.setItem`

Set storage value

**Arguments**

- **key** <code>String</code> - storage key
- **value** <a href="any.html">any</a> - storage value
- **[options]** (optional) <code>Object</code> - storage options

**Example**

```js
analytics.storage.setItem('storage_key', 'value')
```

### `analytics.storage.removeItem`

Remove storage value

**Arguments**

- **key** <code>String</code> - storage key
- **[options]** (optional) <code>Object</code> - storage options

**Example**

```js
analytics.storage.removeItem('storage_key')
```

## `analytics.plugins`

Management methods for plugins. This is also where custom methods are loaded into the instance.

**Example**

```js
// Enable a plugin by namespace
analytics.plugins.enable('keenio')

// Disable a plugin by namespace
analytics.plugins.disable('google-analytics')
```

### `analytics.plugins.enable`

Enable analytics plugin

**Arguments**

- **plugins** <code>String</code>|<code>Array</code> - name of plugins(s) to disable
- **[callback]** (optional) <code>Function</code> - callback after enable runs

**Example**

```js
analytics.plugins.enable('google')

// Enable multiple plugins at once
analytics.plugins.enable(['google', 'segment'])
```

### `analytics.plugins.disable`

Disable analytics plugin

**Arguments**

- **name** <code>String</code>|<code>Array</code> - name of integration(s) to disable
- **callback** <code>Function</code> - callback after disable runs

**Example**

```js
analytics.plugins.disable('google')

analytics.plugins.disable(['google', 'segment'])
```
<!-- AUTO-GENERATED-CONTENT:END -->
