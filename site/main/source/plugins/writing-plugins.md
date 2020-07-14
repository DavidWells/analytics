---
title: How to write custom analytic plugins
pageTitle: Writing Custom Plugins
description: How to create an analytics plugin
---

The library is designed to work with any third party analytics tool via [plugins](http://getanalytics.io/plugins).

Plugins are a powerful abstraction that let you:

- add a new analytics provider (like google analytics or marketo)
- hook into an existing analytics provider plugin
- or add any kind of logic to react to visitor actions

## Types of plugins

All plugins are just plain javascript objects that expose methods for `analytics` to register and call.

They can be broken down into 2 types:

1. **Provider plugins** - connecting to third party analytic services
2. **Custom plugins** - additional features, data manipulation, & any other side effects.

Both have the same signature, as illustrated below.

## **1. Provider plugins**

A provider plugin typically integrates with a third party analytics tool.

For example, the [`analytics-plugin-google-tag-manager`](http://getanalytics.io/plugins/google-tag-manager/) plugin sends data to Google Tag Manager when page views, custom events, & identifying a visitor occurs.

Provider plugins typically

1. Load in the third party analytics script via `initialize`
2. Use `track`, `page`, and/or `identify` to send data into a third party analytics tool
3. Have a `loaded` function to let analytics know when its safe to send the third party data.

Below is an example of a typically provider plugin

```js
export default function providerPluginExample(userConfig) {
  // return object for analytics to use
  return {
    /* All plugins require a name */
    name: 'my-example-plugin',
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

## **2. Custom plugins**

Non provider specific plugins or "custom plugins" can react to different lifecycle events, modify payloads to third party tools, or add additional functionality to the core `analytics` library.

Below is an example of the [`do-not-track-plugin`](http://getanalytics.io/plugins/do-not-track/). This plugin hooks into the analytics lifecycle and intercepts `page`, `track`, `identify`, & `initialize` calls and cancels them if the user browser settings are set to "Do not track".

```js
export default function doNotTrackPlugin(userConfig = {}) {
  return {
    name: 'do-not-track',
    config: Object.assign({}, userConfig),
    initializeStart: ({ abort, config }) => {
      if (doNotTrackEnabled()) {
        return abort('Cancel the initialize call because do-not-track enabled')
      }
    },
    pageStart: ({ abort, config }) => {
      if (doNotTrackEnabled()) {
        return abort('Cancel the page call because do-not-track enabled')
      }
    },
    identifyStart: ({ abort, config }) => {
      if (doNotTrackEnabled()) {
        return abort('Cancel the identify call because do-not-track enabled')
      }
    },
    trackStart: ({ abort, config }) => {
      if (doNotTrackEnabled()) {
        return abort('Cancel the track call because do-not-track enabled')
      }
    },
  }
}
```

## Plugin API

* @property {string} name - Name of plugin
* @property {Object} [EVENTS] - exposed events of plugin
* @property {Object} [config] - Configuration of plugin
* @property {function} [initialize] - Load analytics scripts method
* @property {function} [page] - Page visit tracking method
* @property {function} [track] - Custom event tracking method
* @property {function} [identify] - User identify method
* @property {function} [loaded] - Function to determine if analytics script loaded
* @property {function} [ready] - Fire function when plugin ready

`name` is required for all plugins. All other methods are optional.

If you don't need to hook into `page` tracking, for example, just omit the `page` key from your plugin object.

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

## Adding custom methods

Analytics plugins can provide their own custom functionality via the `methods` key.

```js
import Analytics from 'analytics'

// Example plugin with custom methods
const pluginOne = {
  name: 'one',
  // ... page, track, etc
  // Custom functions to expose to analytics instance
  methods: {
    myCustomThing(one, two, three) {
      const analyticsInstance = this.instance
      console.log('Use full analytics instance', analyticsInstance)
    },
    otherCustomThing: (one, two, ...args) => {
      // Arrow functions break this.instance context.
      // The instance is instead injected as last arg
      const analyticsInstance = args[args.length - 1]
      console.log('Use full analytics instance', analyticsInstance)
    },
    // Async function examples
    async fireCustomThing(one, two, three) {
      const { track } = this.instance
      track('customThing')
      return 'data'
    },
    triggerSpecial: async (argOne, argTwo, ...args) => {
      // Arrow functions break this.instance context.
      // The instance is instead injected as last arg
      const analyticsInstance = args[args.length - 1]
      return argOne + argTwo
    }
  }
}

// Example plugin with custom methods
const pluginTwo = {
  name: 'two',
  page: () => { console.log('page view fired') }
  // Custom functions to expose to analytics instance
  methods: {
    cookieBanner(one, two, three) {
      const analyticsInstance = this.instance
      console.log('Use full analytics instance', analyticsInstance)
      const cookieSettings = analyticsInstance.storage.getItem('preferences-set')
      if (!cookieSettings) {
        // Show cookie settings
      }
    },
  }
}

// Initialize analytics instance with plugins
const analytics = Analytics({
  app: 'your-app-name',
  plugins: [
    pluginOne,
    pluginTwo
  ]
})

// Using custom methods in your code
analytics.plugins.one.myCustomThing()
analytics.plugins.two.cookieBanner()
```

## React to any event

Plugins can react to any event flowing through the `analytics` library.

For example, if you wanted to trigger custom logic when `analytics` bootstraps you can attach a function handler to the `bootstrap` event.

For a full list of core events, checkout [`events.js`](https://github.com/DavidWells/analytics/blob/master/packages/analytics-core/src/events.js).

```js
// Example Plugin plugin.js
export default function myPlugin(userConfig) {
  return {
    name: 'my-plugin',
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

##  Plugin Naming Conventions

Plugins should follow this naming convention before being published to npm

```bash
analytics-plugin-{your-plugin-name}
```

E.g. An analytics plugin that does `awesome-stuff` should be named

```bash
npm install analytics-plugin-awesome-stuff
```

## Need help?

If you have questions about what plugins can do, or how to build one feel free to reach out to [@DavidWells](https://twitter.com/davidwells) on twitter.
