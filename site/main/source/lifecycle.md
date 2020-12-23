---
title: Analytics Lifecycle Events
pageTitle: Lifecycle Events
description: Using lifecycle events to add custom functionality
---

The `analytics` library is driven by a series of **lifecycle events**. These events allow developers to extend & customize the library to fit any tracking requirements.

Events can be hooked into by [listeners](https://getanalytics.io/using-listeners/) in your app code or by [plugins](https://getanalytics.io/plugins/) included at library [initialization](https://getanalytics.io/api/#configuration).

The lifecycle flows like so 👇, and continues depending on which [methods](https://getanalytics.io/api/) are called by your application.

![Analytics Lifecycle](https://user-images.githubusercontent.com/532272/64586657-db813300-d351-11e9-83d8-0d81c6973e49.png)

Below is a list of events exposed by default. To see the events flowing through your setup, turn on [debug mode](https://getanalytics.io/debugging/) or check out the [demo](https://analytics-demo.netlify.com/).

## Initialization Events

| Event | Description |
|:------|:-------|
| **`bootstrap`** | Fires when analytics library starts up.<br/>This is the first event fired. '.on/once' listeners are not allowed on bootstrap<br/>Plugins can attach logic to this event |
| **`params`** | Fires when analytics parses URL parameters |
| **`campaign`** | Fires if params contain "UTM" parameters |
| **`initializeStart`** | Fires before 'initialize', allows for plugins to cancel loading of other plugins |
| **`initialize`** | Fires when analytics loads plugins |
| **`initializeEnd`** | Fires after initialize, allows for plugins to run logic after initialization methods run |
| **`ready`** | Fires when all analytic providers are fully loaded. This waits for 'initialize' and 'loaded' to return true |

## Page Events

| Event | Description |
|:------|:-------|
| **`pageStart`** | Fires before 'page' events fire.<br/> This allows for dynamic page view cancellation based on current state of user or options passed in. |
| **`page`** | Core analytics hook for page views.<br/> If your plugin or integration tracks page views, this is the event to fire on. |
| **`pageEnd`** | Fires after all registered 'page' methods fire. |
| **`pageAborted`** | Fires if 'page' call is cancelled by a plugin |

## Track Events

| Event | Description |
|:------|:-------|
| **`trackStart`** | Called before the 'track' events fires.<br/> This allows for dynamic page view cancellation based on current state of user or options passed in. |
| **`track`** | Core analytics hook for event tracking.<br/> If your plugin or integration tracks custom events, this is the event to fire on. |
| **`trackEnd`** | Fires after all registered 'track' events fire from plugins. |
| **`trackAborted`** | Fires if 'track' call is cancelled by a plugin |

## Identify Events

| Event | Description |
|:------|:-------|
| **`identifyStart`** | Called before the 'identify' events fires.<br/>This allows for dynamic page view cancellation based on current state of user or options passed in. |
| **`identify`** | Core analytics hook for user identification.<br/> If your plugin or integration identifies users or user traits, this is the event to fire on. |
| **`identifyEnd`** | Fires after all registered 'identify' events fire from plugins. |
| **`identifyAborted`** | Fires if 'track' call is cancelled by a plugin |
| **`userIdChanged`** | Fires when a user id is updated |

## Storage Events

| Event | Description |
|:------|:-------|
| **`setItemStart`** | Fires when analytics.storage.setItem is initialized.<br/>This event gives plugins the ability to intercept keys & values and alter them before they are persisted. |
| **`setItem`** | Fires when analytics.storage.setItem is called.<br/>This event gives plugins the ability to intercept keys & values and alter them before they are persisted. |
| **`setItemEnd`** | Fires when setItem storage is complete. |
| **`setItemAborted`** | Fires when setItem storage is cancelled by a plugin. |
| **`removeItemStart`** | Fires when analytics.storage.removeItem is initialized.<br/>This event gives plugins the ability to intercept removeItem calls and abort / alter them. |
| **`removeItem`** | Fires when analytics.storage.removeItem is called.<br/>This event gives plugins the ability to intercept removeItem calls and abort / alter them. |
| **`removeItemEnd`** | Fires when removeItem storage is complete. |
| **`removeItemAborted`** | Fires when removeItem storage is cancelled by a plugin. |

## Network Events

| Event | Description |
|:------|:-------|
| **`online`** | Fires when browser network goes online.<br/>This fires only when coming back online from an offline state. |
| **`offline`** | Fires when browser network goes offline. |

## Other Events

| Event | Description |
|:------|:-------|
| **`resetStart`** | Fires if analytic.reset() is called.<br/>Use this event to cancel reset based on a specific condition |
| **`reset`** | Fires if analytic.reset() is called.<br/>Use this event to run custom cleanup logic (if needed) |
| **`resetEnd`** | Fires after analytic.reset() is called.<br/>Use this event to run a callback after user data is reset |
| **`registerPlugins`** | Fires when analytics is registering plugins |
| **`enablePlugin`** | Fires when 'analytics.plugins.enable()' is called |
| **`disablePlugin`** | Fires when 'analytics.plugins.disable()' is called |

## Example using Listeners

```js
import analytics from './analytics'

analytics.on('trackEnd', () => {
  console.log('analytics.track() call has completed')
})

analytics.once('params', ({ payload }) => {
  console.log('Found url params', payload)
})
```

## Example using Plugins

Plugins can attach to any exposed lifecycle `events`. This is how [provider plugins](https://getanalytics.io/plugins/writing-plugins/#1-provider-plugins) work.

Here's a quick example:

```js
import Analytics from 'analytics'

/* Your custom code */
const myCustomPlugin = {
  name: 'do-not-track',
  /* Hook into initializeStart. This is before third party scripts have loaded on the page */
  initializeStart: ({ abort, config }) => {
    return abort('Cancel the initialize call because of reason XYZ')
  },
  // ... attach additional functionality to other events
}


const analytics = Analytics({
  app: 'app-name',
  plugins: [
    myCustomPlugin
  ]
})

/* export the instance for usage in your app */
export default analytics
```

See the [writing custom plugins guide](https://getanalytics.io/plugins/writing-plugins/)
