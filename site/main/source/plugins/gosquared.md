---
title: GoSquared
description: Using the GoSquared plugin
---

Integration with [GoSquared](https://www.gosquared.com/) for [analytics](https://www.npmjs.com/package/analytics)

GoSquared provides analytics, live chat, & automation tools to help developers identify areas of improvement in their application flows & to help convert users.

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
- [Finding your GoSquared projectToken](#finding-your-gosquared-projecttoken)
- [Running on localHost](#running-on-localhost)

</details>
<!-- AUTO-GENERATED-CONTENT:END -->

## Installation

Install `analytics` and `@analytics/gosquared` packages

```bash
npm install analytics
npm install @analytics/gosquared
```

<!-- AUTO-GENERATED-CONTENT:START (PLUGIN_DOCS) -->

## How to use

The `@analytics/gosquared` package works in [the browser](#browser-usage). To use, install the package, include in your project and initialize the plugin with [analytics](https://www.npmjs.com/package/analytics).

Below is an example of how to use the browser plugin.

```js
import Analytics from 'analytics'
import goSquaredPlugin from '@analytics/gosquared'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    goSquaredPlugin({
      projectToken: 'GSN-123456-A'
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

After initializing `analytics` with the `goSquaredPlugin` plugin, data will be sent into GoSquared whenever [analytics.page](https://getanalytics.io/api/#analyticspage), [analytics.track](https://getanalytics.io/api/#analyticstrack), or [analytics.identify](https://getanalytics.io/api/#analyticsidentify) are called.

See [additional implementation examples](#additional-examples) for more details on using in your project.

## Platforms Supported

The `@analytics/gosquared` package works in [the browser](#browser-usage)

## Browser usage

The GoSquared client side browser plugin works with these analytic api methods:

- **[analytics.page](https://getanalytics.io/api/#analyticspage)** - Sends page views into GoSquared
- **[analytics.reset](https://getanalytics.io/api/#analyticsreset)** - Reset browser storage cookies & localstorage for GoSquared values
- **[analytics.track](https://getanalytics.io/api/#analyticstrack)** - Track custom events and send to GoSquared
- **[analytics.identify](https://getanalytics.io/api/#analyticsidentify)** - Identify visitors and send details to GoSquared

### Browser API

```js
import Analytics from 'analytics'
import goSquaredPlugin from '@analytics/gosquared'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    goSquaredPlugin({
      projectToken: 'GSN-123456-A'
    })
  ]
})

```

### Configuration options for browser

| Option | description |
|:---------------------------|:-----------|
| `projectToken` <br/>**required** - string| GoSquared project token for client side tracking |
| `disableAnonymousTraffic` <br/>_optional_ - boolean| Disable anonymous events from firing |
| `trackLocal` <br/>_optional_ - boolean| Enable tracking on localhost |
| `anonymizeIP` <br/>_optional_ - boolean| Prevent the visitors' IP address from being tracked |
| `cookieDomain` <br/>_optional_ - string| Override default cookie domain for subdomain tracking |
| `useCookies` <br/>_optional_ - boolean| Set to false to disable usage of cookies in the tracker |
| `trackHash` <br/>_optional_ - boolean| Whether to track hashes in the page URL |
| `trackParams` <br/>_optional_ - boolean| Whether to track URL querystring parameters |

## Additional examples

Below are additional implementation examples.

<details>
  <summary>Using in HTML</summary>

  Below is an example of importing via the unpkg CDN. Please note this will pull in the latest version of the package.

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/gosquared in HTML</title>
      <script src="https://unpkg.com/analytics/dist/analytics.min.js"></script>
      <script src="https://unpkg.com/@analytics/gosquared/dist/@analytics/gosquared.min.js"></script>
      <script type="text/javascript">
        /* Initialize analytics */
        var Analytics = _analytics.init({
          app: 'my-app-name',
          plugins: [
            analyticsGoSquared({
              projectToken: 'GSN-123456-A'
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

  Using `@analytics/gosquared` in ESM modules.

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/gosquared in HTML via ESModules</title>
      <script>
        // Polyfill process.
        // **Note**: Because `import`s are hoisted, we need a separate, prior <script> block.
        window.process = window.process || { env: { NODE_ENV: 'production' } }
      </script>
      <script type="module">
        import analytics from 'https://unpkg.com/analytics/lib/analytics.browser.es.js?module'
        import analyticsGoSquared from 'https://unpkg.com/@analytics/gosquared/lib/analytics-plugin-gosquared.browser.es.js?module'
        /* Initialize analytics */
        const Analytics = analytics({
          app: 'analytics-html-demo',
          debug: true,
          plugins: [
            analyticsGoSquared({
              projectToken: 'GSN-123456-A'
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

## Finding your GoSquared projectToken

Inside of the GoSquared admin panel you can find your tracking ID in the URL of the dashboard.

![image](https://user-images.githubusercontent.com/532272/70370383-9a7abb00-187b-11ea-8fc7-97584d5ba8c2.png)

It's also visible in the tracking code

![image](https://user-images.githubusercontent.com/532272/70370401-b7af8980-187b-11ea-9f2b-dfac31b427af.png)

Take the `projectToken` value and use it in the initialization of the plugin

## Running on localHost

By default this plugin does not send data when running locally. This helps prevent local development from polluting your stats.

To turn on localhost tracking, set the `trackLocal` configuration setting to true.

```js
const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    goSquaredPlugin({
      projectToken: 'GSN-123456-A',
      trackLocal: true
    })
  ]
})
```
