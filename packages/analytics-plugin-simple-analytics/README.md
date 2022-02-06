<!--
title: Simple Analytics
description: Using the Simple Analytics plugin
-->
# Simple Analytics Plugin

Integration with simple analytics [Simple Analytics](https://simpleanalytics.com/)

The simple analytics plugin automatically tracks page views on route changes for single page applications.

For more information [see the docs](https://getanalytics.io/plugins/simple-analytics/).

<!-- AUTO-GENERATED-CONTENT:START (TOC:collapse=true&collapseText=Click to expand) -->
<details>
<summary>Click to expand</summary>

- [Installation](#installation)
- [How to use](#how-to-use)
- [Platforms Supported](#platforms-supported)
- [Browser usage](#browser-usage)
  - [Browser API](#browser-api)
  - [Configuration options for browser](#configuration-options-for-browser)
- [Additional examples](#additional-examples)

</details>
<!-- AUTO-GENERATED-CONTENT:END -->

## Installation

```bash
npm install analytics
npm install @analytics/simple-analytics
```

<!-- AUTO-GENERATED-CONTENT:START (PLUGIN_DOCS) -->

## How to use

The `@analytics/simple-analytics` package works in [the browser](#browser-usage). To use, install the package, include in your project and initialize the plugin with [analytics](https://www.npmjs.com/package/analytics).

Below is an example of how to use the browser plugin.

```js
import Analytics from 'analytics'
import simpleAnalyticsPlugin from '@analytics/simple-analytics'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [simpleAnalyticsPlugin()]
})

/* Track a custom event */
analytics.track('cartCheckout', {
  item: 'pink socks',
  price: 20
})

```

After initializing `analytics` with the `simpleAnalyticsPlugin` plugin, data will be sent into Simple Analytics whenever or [analytics.track](https://getanalytics.io/api/#analyticstrack) are called.

See [additional implementation examples](#additional-examples) for more details on using in your project.

## Platforms Supported

The `@analytics/simple-analytics` package works in [the browser](#browser-usage)

## Browser usage

The Simple Analytics client side browser plugin works with these analytic api methods:

- **[analytics.track](https://getanalytics.io/api/#analyticstrack)** - Track custom events and send to Simple Analytics

### Browser API

```js
import Analytics from 'analytics'
import simpleAnalyticsPlugin from '@analytics/simple-analytics'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [simpleAnalyticsPlugin()]
})

```

### Configuration options for browser

| Option | description |
|:---------------------------|:-----------|
| `customDomain` <br/>_optional_ - string| Custom domain for simple analytics script. https://docs.simpleanalytics.com/script |
| `hostname` <br/>_optional_ - string| Allow overwriting domain name https://docs.simpleanalytics.com/overwrite-domain-name |
| `collectDnt` <br/>_optional_ - boolean| Allow collecting DNT visitors https://docs.simpleanalytics.com/dnt |
| `mode` <br/>_optional_ - string| Allow hash mode https://docs.simpleanalytics.com/hash-mode |
| `ignorePages` <br/>_optional_ - string| Add ignore pages https://docs.simpleanalytics.com/ignore-pages |
| `saGlobal` <br/>_optional_ - string| Overwrite SA global for events https://docs.simpleanalytics.com/events#the-variable-sa_event-is-already-used |
| `autoCollect` <br/>_optional_ - boolean| Overwrite SA global for events https://docs.simpleanalytics.com/trigger-custom-page-views#use-custom-collection-anyway |
| `onloadCallback` <br/>_optional_ - string| Allow onload callback https://docs.simpleanalytics.com/trigger-custom-page-views#use-custom-collection-anyway |


## Additional examples

Below are additional implementation examples.

<details>
  <summary>Using in HTML</summary>

  Below is an example of importing via the unpkg CDN. Please note this will pull in the latest version of the package.

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/simple-analytics in HTML</title>
      <script src="https://unpkg.com/analytics/dist/analytics.min.js"></script>
      <script src="https://unpkg.com/@analytics/simple-analytics/dist/@analytics/simple-analytics.min.js"></script>
      <script type="text/javascript">
        /* Initialize analytics */
        var Analytics = _analytics.init({
          app: 'my-app-name',
          plugins: [simpleAnalytics()]
        })

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

  Using `@analytics/simple-analytics` in ESM modules.

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/simple-analytics in HTML via ESModules</title>
      <script>
        // Polyfill process.
        // **Note**: Because `import`s are hoisted, we need a separate, prior <script> block.
        window.process = window.process || { env: { NODE_ENV: 'production' } }
      </script>
      <script type="module">
        import analytics from 'https://unpkg.com/analytics/lib/analytics.browser.es.js?module'
        import simpleAnalytics from 'https://unpkg.com/@analytics/simple-analytics/lib/analytics-plugin-simple-analytics.browser.es.js?module'
        /* Initialize analytics */
        const Analytics = analytics({
          app: 'analytics-html-demo',
          debug: true,
          plugins: [
            simpleAnalytics()
            // ... add any other third party analytics plugins
          ]
        })

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
