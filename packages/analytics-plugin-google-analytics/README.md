<!--
title: Adding Google Analytics to your app using open source analytics
description: Connect Google Analytics to the analytics library
pageTitle: Google Analytics
-->

# Google Analytics

This analytics plugin will load google analytics v.4 into your application.

For more information [see the docs](https://getanalytics.io/plugins/google-analytics/).

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
- [Fix "double page views"](#fix-double-page-views)
- [Legacy Google analytics v3](#legacy-google-analytics-v3)
- [Using GA3 and GA4 together](#using-ga3-and-ga4-together)

</details>
<!-- AUTO-GENERATED-CONTENT:END -->

## Installation

```bash
npm install analytics
npm install @analytics/google-analytics
```

<!-- AUTO-GENERATED-CONTENT:START (PLUGIN_DOCS) -->

## How to use

The `@analytics/google-analytics` package works in [the browser](#browser-usage). To use, install the package, include in your project and initialize the plugin with [analytics](https://www.npmjs.com/package/analytics).

Below is an example of how to use the browser plugin.

```js
import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    googleAnalytics({
      measurementIds: ['G-abc123']
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

/* Identify a visitor */
analytics.identify('user-id-xyz', {
  firstName: 'bill',
  lastName: 'murray'
})

```

After initializing `analytics` with the `googleAnalytics` plugin, data will be sent into Google Analytics whenever [analytics.identify](https://getanalytics.io/api/#analyticsidentify), [analytics.page](https://getanalytics.io/api/#analyticspage), or [analytics.track](https://getanalytics.io/api/#analyticstrack) are called.

See [additional implementation examples](#additional-examples) for more details on using in your project.

## Platforms Supported

The `@analytics/google-analytics` package works in [the browser](#browser-usage)

## Browser usage

The Google Analytics client side browser plugin works with these analytic api methods:

- **[analytics.identify](https://getanalytics.io/api/#analyticsidentify)** - Identify visitors and send details to Google Analytics
- **[analytics.page](https://getanalytics.io/api/#analyticspage)** - Sends page views into Google Analytics
- **[analytics.track](https://getanalytics.io/api/#analyticstrack)** - Track custom events and send to Google Analytics

### Browser API

```js
import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    googleAnalytics({
      measurementIds: ['G-abc123']
    })
  ]
})

```

### Configuration options for browser

| Option                                              | description |
|:----------------------------------------------------|:-----------|
| `measurementIds` <br/>**required** - Array.<string> | Google Analytics MEASUREMENT IDs |
| `debug` <br/>_optional_ - boolean                   | Enable Google Analytics debug mode |
| `dataLayerName` <br/>_optional_ - string            | The optional name for dataLayer object. Defaults to ga4DataLayer. |
| `gtagName` <br/>_optional_ - string                 | The optional name for dataLayer object. Defaults to `gtag`. |
| `gtagConfig.anonymize_ip` <br/>_optional_ - boolean | Enable [Anonymizing IP addresses](https://bit.ly/3c660Rd) sent to Google Analytics. |
| `gtagConfig.cookie_domain` <br/>_optional_ - object | Additional cookie properties for configuring the [ga cookie](https://developers.google.com/analytics/devguides/collection/analyticsjs/cookies-user-id#configuring_cookie_field_settings) |
| `gtagConfig.cookie_expires` <br/>_optional_ - object| Additional cookie properties for configuring the [ga cookie](https://developers.google.com/analytics/devguides/collection/analyticsjs/cookies-user-id#configuring_cookie_field_settings) |
| `gtagConfig.cookie_prefix` <br/>_optional_ - object | Additional cookie properties for configuring the [ga cookie](https://developers.google.com/analytics/devguides/collection/analyticsjs/cookies-user-id#configuring_cookie_field_settings) |
| `gtagConfig.cookie_update` <br/>_optional_ - object | Additional cookie properties for configuring the [ga cookie](https://developers.google.com/analytics/devguides/collection/analyticsjs/cookies-user-id#configuring_cookie_field_settings) |
| `gtagConfig.cookie_flags` <br/>_optional_ - object  | Additional cookie properties for configuring the [ga cookie](https://developers.google.com/analytics/devguides/collection/analyticsjs/cookies-user-id#configuring_cookie_field_settings) |
| `customScriptSrc` <br/>_optional_ - string          | Custom URL for google analytics script, if proxying calls |
| `nonce` <br/>_optional_ - string                    | Content-Security-Policy nonce value                            |


## Additional examples

Below are additional implementation examples.

<details>
  <summary>Using in HTML</summary>

  Below is an example of importing via the unpkg CDN. Please note this will pull in the latest version of the package.

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/google-analytics in HTML</title>
      <script src="https://unpkg.com/analytics/dist/analytics.min.js"></script>
      <script src="https://unpkg.com/@analytics/google-analytics/dist/@analytics/google-analytics.min.js"></script>
      <script type="text/javascript">
        /* Initialize analytics */
        var Analytics = _analytics.init({
          app: 'my-app-name',
          plugins: [
            analyticsGa.init({
              measurementIds: ['G-abc123']
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

        /* Identify a visitor */
        analytics.identify('user-id-xyz', {
          firstName: 'bill',
          lastName: 'murray'
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

  Using `@analytics/google-analytics` in ESM modules.

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/google-analytics in HTML via ESModules</title>
      <script>
        // Polyfill process.
        // **Note**: Because `import`s are hoisted, we need a separate, prior <script> block.
        window.process = window.process || { env: { NODE_ENV: 'production' } }
      </script>
      <script type="module">
        import analytics from 'https://unpkg.com/analytics/lib/analytics.browser.es.js?module'
        import analyticsGa from 'https://unpkg.com/@analytics/google-analytics/lib/analytics-plugin-ga.browser.es.js?module'
        /* Initialize analytics */
        const Analytics = analytics({
          app: 'analytics-html-demo',
          debug: true,
          plugins: [
            analyticsGa({
              measurementIds: ['G-abc123']
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

        /* Identify a visitor */
        analytics.identify('user-id-xyz', {
          firstName: 'bill',
          lastName: 'murray'
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

## Fix "double page views"

Google analytics 4 sometimes automatically sends a page view for single page applications. To disable this you will need to go into the settings of your stream and click into "enhanced measurement" section and uncheck the "Page changes based on browser history events" setting. This will make sure only `analytics.page()` calls will send page views to Google analytics v4.

<img width="701" alt="disable-auto-spa-pageviews" src="https://user-images.githubusercontent.com/532272/180305960-b6172469-f3ee-4d48-85fd-3c4d0a07e777.png">

## Legacy Google analytics v3

For the older version of google analytics please see the [`@analytics/google-analytics-v3` package](https://www.npmjs.com/package/@analytics/google-analytics-v3) or the [GA3 plugin docs](https://getanalytics.io/plugins/google-analytics-v3/)

## Using GA3 and GA4 together

It is possible to use both GA3 and GA4 together shown below. Just remember GA3 will be deprecated starting in July of 2023

```js
import Analytics from 'analytics'
import googleAnalyticsPlugin from '@analytics/google-analytics'
import googleAnalyticsV3Plugin from '@analytics/google-analytics-v3'

/* Initialize analytics instance */
const analytics = Analytics({
  app: 'my-app',
  plugins: [
    /* Load Google Analytics v4 */
    googleAnalyticsPlugin({
      measurementIds: ['G-abc123'],
    }),
    /* Load Google Analytics v3 */
    googleAnalyticsV3Plugin({
      trackingId: 'UA-11111111-2',
    }),
  ],
})

analytics.page()
```
