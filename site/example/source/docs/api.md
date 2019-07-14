---
title: API docs
description: Core analytics API
---

The core `analytics` API is exposed once the library is initialized with [configuration](#configuration).

Typical usage:

1. Initialize with [configuration](#configuration)
2. Export the analytics instance with third party providers (Google Analytics, HubSpot, etc)
3. Use [`page`](#analyticspage), [`identify`](#analyticsidentify), [`track`](#analyticstrack) in your app
4. Plugin custom business logic

<!-- AUTO-GENERATED-CONTENT:START (API_DOCS) -->
## Configuration

Analytics library configuration.

After the library is initialized with config, the core API is exposed and ready for use in the application.

**Arguments**

- **config** <code>object</code> - analytics core config
- **[config.app]** (optional) <code>string</code> - Name of site / app
- **[config.version]** (optional) <code>string</code> - Version of your app
- **[config.plugins]** (optional) <code>array</code> - Array of analytics plugins

**Example**

```js{8-9}
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

## analytics.identify

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

## analytics.track

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

## analytics.page

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

## analytics.user

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

## analytics.reset

Clear all information about the visitor & reset analytic state.

**Arguments**

- **[callback]** (optional) <code>Function</code> - Handler to run after reset

**Example**

```js
// Reset current visitor
analytics.reset()
```

## analytics.ready

Fire callback on analytics ready event

**Arguments**

- **callback** <code>Function</code> - function to trigger when all providers have loaded

**Example**

```js
analytics.ready() => {
  console.log('all plugins have loaded or were skipped', payload)
})
```

## analytics.on

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

## analytics.once

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

## analytics.getState

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

## analytics.enablePlugin

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

## analytics.disablePlugin

Disable analytics plugin

**Arguments**

- **name** <code>String</code>|<code>Array</code> - name of integration(s) to disable
- **callback** <code>Function</code> - callback after disable runs

**Example**

```js
analytics.disablePlugin('google')

analytics.disablePlugin(['google', 'segment'])
```

## analytics.storage

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

## analytics.storage.getItem

Get value from storage

**Arguments**

- **key** <code>String</code> - storage key
- **[options]** (optional) <code>Object</code> - storage options

**Example**

```js
analytics.storage.getItem('storage_key')
```

## analytics.storage.setItem

Set storage value

**Arguments**

- **key** <code>String</code> - storage key
- **value** <a href="any.html">any</a> - storage value
- **[options]** (optional) <code>Object</code> - storage options

**Example**

```js
analytics.storage.setItem('storage_key', 'value')
```

## analytics.storage.removeItem

Remove storage value

**Arguments**

- **key** <code>String</code> - storage key
- **[options]** (optional) <code>Object</code> - storage options

**Example**

```js
analytics.storage.removeItem('storage_key')
```
<!-- AUTO-GENERATED-CONTENT:END -->
