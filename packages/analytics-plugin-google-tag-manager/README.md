<!--
title: Google Tag Manager
description: Using the google tag manager plugin
-->
# Google Tag Manager plugin for analytics

Integration with google tag manager for [analytics](https://www.npmjs.com/package/analytics)

This analytics plugin will load google tag manager into your application.

For more information [see the docs](https://getanalytics.io/plugins/google-tag-manager/).

<!-- AUTO-GENERATED-CONTENT:START (TOC:collapse=true&collapseText=Click to expand) -->
<details>
<summary>Click to expand</summary>

- [Installation](#installation)
- [How to use](#how-to-use)
- [Browser usage](#browser-usage)
  * [Browser API](#browser-api)
- [Platforms Supported](#platforms-supported)
- [Additional examples](#additional-examples)
- [Configuring GTM](#configuring-gtm)

</details>
<!-- AUTO-GENERATED-CONTENT:END (TOC) -->

## Installation

Install `analytics` and `@analytics/google-tag-manager` packages

```bash
npm install analytics
npm install @analytics/google-tag-manager
```

<!-- AUTO-GENERATED-CONTENT:START (PLUGIN_DOCS) -->

## How to use

The `@analytics/google-tag-manager` package works in [the browser](#browser-usage). To use, install the package, include in your project and initialize the plugin with [analytics](https://www.npmjs.com/package/analytics).

Below is an example of how to use the browser plugin.

```js
import Analytics from 'analytics'
import googleTagManager from '@analytics/google-tag-manager'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    googleTagManager({
      containerId: 'GTM-123xyz'
    })
  ]
})

/* Track a page view */
analytics.page()

/* Track a custom event */
analytics.track('cartCheckout', {
  item: 'pink socks',
  price: 20
})

```

After initializing `analytics` with the `googleTagManager` plugin, data will be sent into Google Tag Manager whenever [analytics.page](https://getanalytics.io/api/#analyticspage), or [analytics.track](https://getanalytics.io/api/#analyticstrack) are called.

See [additional implementation examples](#additional-examples) for more details on using in your project.

## Browser usage

The Google Tag Manager client side browser plugin works with these analytic api methods:

- **[analytics.page](https://getanalytics.io/api/#analyticspage)** - Sends page views into Google Tag Manager 
- **[analytics.track](https://getanalytics.io/api/#analyticstrack)** - Track custom events and send to Google Tag Manager 

### Browser API

```js
const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    googleTagManager({
      containerId: 'GTM-123xyz'
    })
  ]
})

```

**Initialization arguments**

- **pluginConfig** `object` Plugin settings
- **pluginConfig.containerId** `string` The Container ID uniquely identifies the GTM Container.


## Platforms Supported

The `@analytics/google-tag-manager` package works in [the browser](#browser-usage)

## Additional examples

Below are additional implementation examples.

<details>
  <summary>Using in HTML</summary>

  Below is an example of importing via the unpkg CDN. Please note this will pull in the latest version of the package.

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/google-tag-manager in HTML</title>
      <script src="https://unpkg.com/analytics/dist/analytics.min.js"></script>
      <script src="https://unpkg.com/@analytics/google-tag-manager/dist/@analytics/google-tag-manager.min.js"></script>
      <script type="text/javascript">
        /* Initialize analytics */
        var Analytics = _analytics.init({
          app: 'my-app-name',
          plugins: [
            analyticsGtagManager({
              containerId: 'GTM-123xyz'
            })
          ]
        })

        /* Track a page view */
        analytics.page()

        /* Track a custom event */
        analytics.track('cartCheckout', {
          item: 'pink socks',
          price: 20
        })
      </script>
    </head>
    <body>
      ....
    </body>
  </html>

  ```

</details>

<details>
  <summary>Using in HTML via ES Modules</summary>

  Using `@analytics/google-tag-manager` in ESM modules.

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/google-tag-manager in HTML via ESModules</title>
      <script>
        // Polyfill process.
        // **Note**: Because `import`s are hoisted, we need a separate, prior <script> block.
        window.process = window.process || { env: { NODE_ENV: 'production' } }
      </script>
      <script type="module">
        import analytics from 'https://unpkg.com/analytics/lib/analytics.browser.es.js?module'
        import analyticsGtagManager from 'https://unpkg.com/@analytics/google-tag-manager/lib/analytics-plugin-google-tag-manager.browser.es.js?module'
        /* Initialize analytics */
        const Analytics = analytics({
          app: 'analytics-html-demo',
          debug: true,
          plugins: [
            analyticsGtagManager({
              containerId: 'GTM-123xyz'
            })
            // ... add any other third party analytics plugins
          ]
        })

        /* Track a page view */
        analytics.page()

        /* Track a custom event */
        analytics.track('cartCheckout', {
          item: 'pink socks',
          price: 20
        })
      </script>
    </head>
    <body>
      ....
    </body>
  </html>

  ```

</details>


<!-- AUTO-GENERATED-CONTENT:END (PLUGIN_DOCS) -->

## Configuring GTM

Make sure you have your google tags manager setup to fire on Page views.

If you are using a SPA you want to listen to history changes as well.

![image](https://user-images.githubusercontent.com/532272/52185417-538fe500-27d4-11e9-9500-abf702e5d802.png)

See the [full list of analytics provider plugins](https://getanalytics.io/plugins/) in the main repo.
