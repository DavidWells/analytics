---
title: Using Plugins
description: Listen to analytic events
---

The `analytics` library is extendable via plugins.

This guide will walk through installing & using plugins.

## Installation & Usage

1. **Install analytics & plugins**

    Here we are installing `analytics` & the google tag manager plugin.

    ```bash
    npm install analytics
    npm install analytics-plugin-google-tag-manager
    ```

2. **Include analytics in your project**

    Import `analytics` and any plugins you wish to use in the `plugins` array.

    Plugins need to be attached during initialization.

    ```js
    /* analytics.js */
    import Analytics from 'analytics'
    import googleTagManager from 'analytics-plugin-google-tag-manager'

    // export analytics instance for use in the app
    export default Analytics({
      app: 'app-name',
      plugins: [
        googleTagManager({
          containerId: 'GTM-xyz123'
        })
      ]
    })
    ```

3. **Use in code**

    ```js
    import analytics from './analytics'

    /* Track page views */
    analytics.page()

    /* Identify users */
    analytics.identify('userid-123', {
      favoriteColor: 'blue',
      membershipLevel: 'pro'
    })

    /* Track events */
    analytics.track('buttonClicked', {
      value: 100
    })
    ```

## Selectively disabling plugins

You can disable specific `page`, `track`, `identify` calls from passing through an installed plugin.

In the `options` of the call, pass an `plugins` object and set the `name` of the plugin to `false`. This will disable the call from hitting that particular analytics service.

```js
analytics.identify('xyz-123', {
  super: true,
  rad: 'dope'
}, {
  /* Disable the ‘vanilla’ plugin for this identify call */
  plugins: {
    vanilla: false
  }
})
```

## Disabling plugins

You can disable plugins with the `analytics.disablePlugin` method. This will stop all `track`, `page`, and `identify` calls from sending to the plugin provider.

```js
// Turn off google-analytics calls
analytics.plugins.disable(['google-analytics'])
```

## Enable plugins

You can enable plugins with the `analytics.enablePlugin` method

```js
// Turn on google-analytics calls
analytics.plugins.enable(['google-analytics'])
```
