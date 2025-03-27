<!--
title: ChurnZero
description: Using the ChurnZero analytics plugin
-->
# ChurnZero plugin for `analytics`

Integration with ChurnZero for [analytics](https://www.npmjs.com/package/analytics)

This analytics plugin will load ChurnZero's client side tracking script into your application and send custom events, page views, and identify visitors inside ChurnZero.

[View the docs](https://getanalytics.io/plugins/churn-zero/)

<!-- AUTO-GENERATED-CONTENT:START (TOC:collapse=true&collapseText=Click to expand) -->
<details>
<summary>Click to expand</summary>

- [Installation](#installation)
- [How to use](#how-to-use)
- [Platforms Supported](#platforms-supported)
- [Browser usage](#browser-usage)
  - [Browser API](#browser-api)
  - [Configuration options for browser](#configuration-options-for-browser)
- [Server-side usage](#server-side-usage)
  - [Server-side API](#server-side-api)
  - [Configuration options for server-side](#configuration-options-for-server-side)
- [Additional examples](#additional-examples)

</details>
<!-- AUTO-GENERATED-CONTENT:END (TOC) -->

## Installation

Install `analytics` and `@analytics/churn-zero` packages

```bash
npm install analytics
npm install @analytics/churn-zero
```

<!-- AUTO-GENERATED-CONTENT:START (PLUGIN_DOCS) -->

## How to use

The `@analytics/churn-zero` package works in [the browser](#browser-usage) and [server-side in Node.js](#server-side-usage). To use, install the package, include in your project and initialize the plugin with [analytics](https://www.npmjs.com/package/analytics).

Below is an example of how to use the browser plugin.

```js
import Analytics from 'analytics'
import churnZeroPlugin from '@analytics/churn-zero'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    // This will load crazy egg on to the page
    churnZeroPlugin({
      accountId: '1234578'
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

After initializing `analytics` with the `churnZeroPlugin` plugin, data will be sent into ChurnZero whenever [analytics.page](https://getanalytics.io/api/#analyticspage), [analytics.track](https://getanalytics.io/api/#analyticstrack), or [analytics.identify](https://getanalytics.io/api/#analyticsidentify) are called.

See [additional implementation examples](#additional-examples) for more details on using in your project.

## Platforms Supported

The `@analytics/churn-zero` package works in [the browser](#browser-usage) and [server-side in Node.js](#server-side-usage)

## Browser usage

The ChurnZero client side browser plugin works with these analytic api methods:

- **[analytics.identify](https://getanalytics.io/api/#analyticsidentify)** - Identify visitors and send details to ChurnZero
- **[analytics.page](https://getanalytics.io/api/#analyticspage)** - Sends page views into ChurnZero
- **[analytics.track](https://getanalytics.io/api/#analyticstrack)** - Track custom events and send to ChurnZero

### Browser API

```js
import Analytics from 'analytics'
import churnZeroPlugin from '@analytics/churn-zero'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    // This will load crazy egg on to the page
    churnZeroPlugin({
      accountId: '1234578'
    })
  ]
})

```

### Configuration options for browser

| Option | description |
|:---------------------------|:-----------|
| `accountId` <br/>**required** - string| ChurnZero account ID |
| `scriptInclude` <br/>_optional_ - boolean| Load ChurnZero script into page |
| `options` <br/>_optional_ - object| ChurnZero script options |

## Server-side usage

The ChurnZero server-side node.js plugin works with these analytic api methods:

- **[analytics.page](https://getanalytics.io/api/#analyticspage)** - Sends page views into ChurnZero
- **[analytics.track](https://getanalytics.io/api/#analyticstrack)** - Track custom events and send to ChurnZero
- **[analytics.identify](https://getanalytics.io/api/#analyticsidentify)** - Identify visitors and send details to ChurnZero

### Server-side API

```js
import Analytics from 'analytics'
import churnZeroPlugin from '@analytics/churn-zero'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    churnZeroPlugin({
      apiKey: 'abc123'
    })
  ]
})

```

### Configuration options for server-side

| Option | description |
|:---------------------------|:-----------|
| `apiKey` <br/>**required** - string| ChurnZero API key |


## Additional examples

Below are additional implementation examples.

<details>
  <summary>Server-side ES6</summary>

  ```js
  import Analytics from 'analytics'
  import churnZeroPlugin from '@analytics/churn-zero'

  const analytics = Analytics({
    app: 'awesome-app',
    plugins: [
      churnZeroPlugin({
        apiKey: 'abc123'
      })
      // ...other plugins
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

</details>

<details>
  <summary>Server-side Node.js with common JS</summary>

  If using node, you will want to import the `.default`

  ```js
  const analyticsLib = require('analytics').default
  const churnZeroPlugin = require('@analytics/churn-zero').default

  const analytics = analyticsLib({
    app: 'my-app-name',
    plugins: [
      churnZeroPlugin({
        apiKey: 'abc123'
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

</details>

<details>
  <summary>Using in HTML</summary>

  Below is an example of importing via the unpkg CDN. Please note this will pull in the latest version of the package.

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/churn-zero in HTML</title>
      <script src="https://unpkg.com/analytics/dist/analytics.min.js"></script>
      <script src="https://unpkg.com/@analytics/churn-zero/dist/@analytics/churn-zero.min.js"></script>
      <script type="text/javascript">
        /* Initialize analytics */
        var Analytics = _analytics.init({
          app: 'my-app-name',
          plugins: [
            // This will load crazy egg on to the page
            analyticsChurnZero({
              accountId: '1234578'
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

  Using `@analytics/churn-zero` in ESM modules.

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/churn-zero in HTML via ESModules</title>
      <script>
        // Polyfill process.
        // **Note**: Because `import`s are hoisted, we need a separate, prior <script> block.
        window.process = window.process || { env: { NODE_ENV: 'production' } }
      </script>
      <script type="module">
        import analytics from 'https://unpkg.com/analytics/lib/analytics.browser.es.js?module'
        import analyticsChurnZero from 'https://unpkg.com/@analytics/churn-zero/lib/analytics-plugin-churn-zero.browser.es.js?module'
        /* Initialize analytics */
        const Analytics = analytics({
          app: 'analytics-html-demo',
          debug: true,
          plugins: [
            // This will load crazy egg on to the page
            analyticsChurnZero({
              accountId: '1234578'
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
