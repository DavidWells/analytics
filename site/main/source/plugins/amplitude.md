---
title: Adding Amplitude to your app using open source analytics
description: Connect Amplitude to the analytics library
pageTitle: Amplitude
---

This library exports the `amplitude` plugin for the [`analytics`](https://www.npmjs.com/package/analytics) package.

This analytics plugin will load Amplitude integration into your application.

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
npm install @analytics/amplitude
```

<!-- AUTO-GENERATED-CONTENT:START (PLUGIN_DOCS) -->

## How to use

The `@analytics/amplitude` package works in [the browser](#browser-usage). To use, install the package, include in your project and initialize the plugin with [analytics](https://www.npmjs.com/package/analytics).

Below is an example of how to use the browser plugin.

```js
import Analytics from 'analytics'
import amplitudePlugin from '@analytics/amplitude'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    amplitudePlugin({
      apiKey: 'token',
      // See options at https://bit.ly/3dRdZnE
      options: {
        trackingOptions: {
          ip_address: false
        }
      }
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

After initializing `analytics` with the `amplitudePlugin` plugin, data will be sent into Amplitude whenever [analytics.page](https://getanalytics.io/api/#analyticspage), [analytics.track](https://getanalytics.io/api/#analyticstrack), or [analytics.identify](https://getanalytics.io/api/#analyticsidentify) are called.

See [additional implementation examples](#additional-examples) for more details on using in your project.

## Platforms Supported

The `@analytics/amplitude` package works in [the browser](#browser-usage)

## Browser usage

The Amplitude client side browser plugin works with these analytic api methods:

- **[analytics.page](https://getanalytics.io/api/#analyticspage)** - Sends page views into Amplitude
- **[analytics.track](https://getanalytics.io/api/#analyticstrack)** - Track custom events and send to Amplitude
- **[analytics.identify](https://getanalytics.io/api/#analyticsidentify)** - Identify visitors and send details to Amplitude

### Browser API

```js
import Analytics from 'analytics'
import amplitudePlugin from '@analytics/amplitude'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    amplitudePlugin({
      apiKey: 'token',
      // See options at https://bit.ly/3dRdZnE
      options: {
        trackingOptions: {
          ip_address: false
        }
      }
    })
  ]
})

```

### Configuration options for browser

| Option | description |
|:---------------------------|:-----------|
| `apiKey` <br/>**required** - string| Amplitude project API key |
| `options` <br/>**required** - object| Amplitude SDK options |

## Additional examples

Below are additional implementation examples.

<details>
  <summary>Using in HTML</summary>

  Below is an example of importing via the unpkg CDN. Please note this will pull in the latest version of the package.

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/amplitude in HTML</title>
      <script src="https://unpkg.com/analytics/dist/analytics.min.js"></script>
      <script src="https://unpkg.com/@analytics/amplitude/dist/@analytics/amplitude.min.js"></script>
      <script type="text/javascript">
        /* Initialize analytics */
        var Analytics = _analytics.init({
          app: 'my-app-name',
          plugins: [
            undefined({
              apiKey: 'token',
              // See options at https://bit.ly/3dRdZnE
              options: {
                trackingOptions: {
                  ip_address: false
                }
              }
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

  Using `@analytics/amplitude` in ESM modules.

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/amplitude in HTML via ESModules</title>
      <script>
        // Polyfill process.
        // **Note**: Because `import`s are hoisted, we need a separate, prior <script> block.
        window.process = window.process || { env: { NODE_ENV: 'production' } }
      </script>
      <script type="module">
        import analytics from 'https://unpkg.com/analytics/lib/analytics.browser.es.js?module'
        import undefined from 'https://unpkg.com/@analytics/amplitude/lib/analytics-plugin-amplitude.browser.es.js?module'
        /* Initialize analytics */
        const Analytics = analytics({
          app: 'analytics-html-demo',
          debug: true,
          plugins: [
            undefined({
              apiKey: 'token',
              // See options at https://bit.ly/3dRdZnE
              options: {
                trackingOptions: {
                  ip_address: false
                }
              }
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
