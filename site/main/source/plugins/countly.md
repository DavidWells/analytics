---
title: Countly
description: Using the Countly analytics plugin
---

Integration with Countly for [analytics](https://www.npmjs.com/package/analytics)

This analytics plugin will load Countly library and allow to send tracking sessions, views, clicks, custom events, user data, etc.

## Installation

```bash
npm install analytics
npm install @analytics/countly
```

<!-- AUTO-GENERATED-CONTENT:START (TOC:collapse=true&collapseText=Click to expand) -->
<details>
<summary>Click to expand</summary>

- [Installation](#installation)
- [Installation](#installation-1)
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

```bash
npm install analytics
npm install @analytics/amplitude
```

<!-- AUTO-GENERATED-CONTENT:START (PLUGIN_DOCS) -->

## How to use

The `@analytics/countly` package works in [the browser](#browser-usage) and [server-side in Node.js](#server-side-usage). To use, install the package, include in your project and initialize the plugin with [analytics](https://www.npmjs.com/package/analytics).

Below is an example of how to use the browser plugin.

```js
import Analytics from 'analytics'
import countlyPlugin from '@analytics/countly'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    countlyPlugin({
      app_key: 'YOUR_APP_KEY',
      server_url: 'https://YOUR_COUNTLY_SERVER_URL',
      remote_config: true,
      require_consent: true
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

After initializing `analytics` with the `countlyPlugin` plugin, data will be sent into Countly whenever [analytics.page](https://getanalytics.io/api/#analyticspage), [analytics.track](https://getanalytics.io/api/#analyticstrack), or [analytics.identify](https://getanalytics.io/api/#analyticsidentify) are called.

See [additional implementation examples](#additional-examples) for more details on using in your project.

## Platforms Supported

The `@analytics/countly` package works in [the browser](#browser-usage) and [server-side in Node.js](#server-side-usage)

## Browser usage

The Countly client side browser plugin works with these analytic api methods:

- **[analytics.identify](https://getanalytics.io/api/#analyticsidentify)** - Identify visitors and send details to Countly
- **[analytics.page](https://getanalytics.io/api/#analyticspage)** - Sends page views into Countly
- **[analytics.track](https://getanalytics.io/api/#analyticstrack)** - Track custom events and send to Countly
- **[analytics.reset](https://getanalytics.io/api/#analyticsreset)** - Reset browser storage cookies & localstorage for Countly values

### Browser API

```js
import Analytics from 'analytics'
import countlyPlugin from '@analytics/countly'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    countlyPlugin({
      app_key: 'YOUR_APP_KEY',
      server_url: 'https://YOUR_COUNTLY_SERVER_URL',
      remote_config: true,
      require_consent: true
    })
  ]
})

```

### Configuration options for browser

| Option | description |
|:---------------------------|:-----------|
| `app_key` <br/>**required** - string| Your app key from Countly |
| `server_url` <br/>**required** - string| Url of the Countly server |
| `remote_config` <br/>**required** - boolean| Remote config enabler flag |
| `require_consent` <br/>**required** - boolean| Disable tracking until given consent (default: false) |

## Server-side usage

The Countly server-side node.js plugin works with these analytic api methods:

- **[analytics.page](https://getanalytics.io/api/#analyticspage)** - Sends page views into Countly
- **[analytics.track](https://getanalytics.io/api/#analyticstrack)** - Track custom events and send to Countly
- **[analytics.identify](https://getanalytics.io/api/#analyticsidentify)** - Identify visitors and send details to Countly

### Server-side API

```js
import Analytics from 'analytics'
import countlyPlugin from '@analytics/countly'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    countly({
      app_key: 'your_app_key',
      server_url: 'https://your_countly_server_url',
      debug: true
    })
  ]
})

```

### Configuration options for server-side

| Option | description |
|:---------------------------|:-----------|
| `app_key` <br/>**required** - string| Your app key from Countly |
| `server_url` <br/>**required** - string| Url of the Countly server |
| `debug` <br/>**required** - boolean| Set debug flag |

## Additional examples

Below are additional implementation examples.

<details>
  <summary>Server-side ES6</summary>

  ```js
  import Analytics from 'analytics'
  import countlyPlugin from '@analytics/countly'

  const analytics = Analytics({
    app: 'awesome-app',
    plugins: [
      countly({
        app_key: 'your_app_key',
        server_url: 'https://your_countly_server_url',
        debug: true
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
  const countlyPlugin = require('@analytics/countly').default

  const analytics = analyticsLib({
    app: 'my-app-name',
    plugins: [
      countly({
        app_key: 'your_app_key',
        server_url: 'https://your_countly_server_url',
        debug: true
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
      <title>Using @analytics/countly in HTML</title>
      <script src="https://unpkg.com/analytics/dist/analytics.min.js"></script>
      <script src="https://unpkg.com/@analytics/countly/dist/@analytics/countly.min.js"></script>
      <script type="text/javascript">
        /* Initialize analytics */
        var Analytics = _analytics.init({
          app: 'my-app-name',
          plugins: [
            analyticsCountly({
              app_key: 'YOUR_APP_KEY',
              server_url: 'https://YOUR_COUNTLY_SERVER_URL',
              remote_config: true,
              require_consent: true
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

  Using `@analytics/countly` in ESM modules.

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/countly in HTML via ESModules</title>
      <script>
        // Polyfill process.
        // **Note**: Because `import`s are hoisted, we need a separate, prior <script> block.
        window.process = window.process || { env: { NODE_ENV: 'production' } }
      </script>
      <script type="module">
        import analytics from 'https://unpkg.com/analytics/lib/analytics.browser.es.js?module'
        import analyticsCountly from 'https://unpkg.com/@analytics/countly/lib/analytics-plugin-countly.browser.es.js?module'
        /* Initialize analytics */
        const Analytics = analytics({
          app: 'analytics-html-demo',
          debug: true,
          plugins: [
            analyticsCountly({
              app_key: 'YOUR_APP_KEY',
              server_url: 'https://YOUR_COUNTLY_SERVER_URL',
              remote_config: true,
              require_consent: true
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