<!--
title: Customer.io
description: Using the customer.io plugin
-->
# Customer.io plugin for analytics

Integration with [customer.io](https://customer.io/) for [analytics](https://www.npmjs.com/package/analytics) package.

[View the docs](https://getanalytics.io/plugins/customerio/)

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
<!-- AUTO-GENERATED-CONTENT:END -->

## Installation

Install `analytics` and `@analytics/customerio` packages

```bash
npm install analytics
npm install @analytics/customerio
```

<!-- AUTO-GENERATED-CONTENT:START (PLUGIN_DOCS) -->

## How to use

The `@analytics/customerio` package works in [the browser](#browser-usage) and [server-side in Node.js](#server-side-usage). To use, install the package, include in your project and initialize the plugin with [analytics](https://www.npmjs.com/package/analytics).

Below is an example of how to use the browser plugin.

```js
import Analytics from 'analytics'
import customerIOPlugin from '@analytics/customerio'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    customerIOPlugin({
      siteId: '123-xyz'
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

After initializing `analytics` with the `customerIOPlugin` plugin, data will be sent into Customer.io whenever [analytics.page](https://getanalytics.io/api/#analyticspage), [analytics.track](https://getanalytics.io/api/#analyticstrack), or [analytics.identify](https://getanalytics.io/api/#analyticsidentify) are called.

See [additional implementation examples](#additional-examples) for more details on using in your project.

## Platforms Supported

The `@analytics/customerio` package works in [the browser](#browser-usage) and [server-side in Node.js](#server-side-usage)

## Browser usage

The Customer.io client side browser plugin works with these analytic api methods:

- **[analytics.page](https://getanalytics.io/api/#analyticspage)** - Sends page views into Customer.io
- **[analytics.reset](https://getanalytics.io/api/#analyticsreset)** - Reset browser storage cookies & localstorage for Customer.io values
- **[analytics.track](https://getanalytics.io/api/#analyticstrack)** - Track custom events and send to Customer.io
- **[analytics.identify](https://getanalytics.io/api/#analyticsidentify)** - Identify visitors and send details to Customer.io

### Browser API

```js
import Analytics from 'analytics'
import customerIOPlugin from '@analytics/customerio'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    customerIOPlugin({
      siteId: '123-xyz'
    })
  ]
})

```

### Configuration options for browser

| Option | description |
|:---------------------------|:-----------|
| `siteId` <br/>**required** - string| Customer.io site Id for client side tracking |
| `disableAnonymousTraffic` <br/>_optional_ - boolean| Disable anonymous events from firing |

## Server-side usage

The Customer.io server-side node.js plugin works with these analytic api methods:

- **[analytics.page](https://getanalytics.io/api/#analyticspage)** - Sends page views into Customer.io
- **[analytics.track](https://getanalytics.io/api/#analyticstrack)** - Track custom events and send to Customer.io
- **[analytics.identify](https://getanalytics.io/api/#analyticsidentify)** - Identify visitors and send details to Customer.io

### Server-side API

```js
import Analytics from 'analytics'
import customerIOServer from '@analytics/customerio'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    customerIOServer({
      siteId: '123-xyz',
      apiKey: '9876543'
    })
  ]
})

```

### Configuration options for server-side

| Option | description |
|:---------------------------|:-----------|
| `siteId` <br/>**required** - string| Customer.io site Id for server side tracking |
| `apiKey` <br/>**required** - string| Customer.io API key for server side tracking |


## Additional examples

Below are additional implementation examples.

<details>
  <summary>Server-side ES6</summary>

  ```js
  import Analytics from 'analytics'
  import customerIOServer from '@analytics/customerio'

  const analytics = Analytics({
    app: 'awesome-app',
    plugins: [
      customerIOServer({
        siteId: '123-xyz',
        apiKey: '9876543'
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
  const customerIOServer = require('@analytics/customerio').default

  const analytics = analyticsLib({
    app: 'my-app-name',
    plugins: [
      customerIOServer({
        siteId: '123-xyz',
        apiKey: '9876543'
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
      <title>Using @analytics/customerio in HTML</title>
      <script src="https://unpkg.com/analytics/dist/analytics.min.js"></script>
      <script src="https://unpkg.com/@analytics/customerio/dist/@analytics/customerio.min.js"></script>
      <script type="text/javascript">
        /* Initialize analytics */
        var Analytics = _analytics.init({
          app: 'my-app-name',
          plugins: [
            analyticsCustomerio({
              siteId: '123-xyz'
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

  Using `@analytics/customerio` in ESM modules.

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/customerio in HTML via ESModules</title>
      <script>
        // Polyfill process.
        // **Note**: Because `import`s are hoisted, we need a separate, prior <script> block.
        window.process = window.process || { env: { NODE_ENV: 'production' } }
      </script>
      <script type="module">
        import analytics from 'https://unpkg.com/analytics/lib/analytics.browser.es.js?module'
        import analyticsCustomerio from 'https://unpkg.com/@analytics/customerio/lib/analytics-plugin-customerio.browser.es.js?module'
        /* Initialize analytics */
        const Analytics = analytics({
          app: 'analytics-html-demo',
          debug: true,
          plugins: [
            analyticsCustomerio({
              siteId: '123-xyz'
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


<!-- AUTO-GENERATED-CONTENT:END -->


See the [full list of analytics provider plugins](https://github.com/DavidWells/analytics#current-plugins) in the main repo.
