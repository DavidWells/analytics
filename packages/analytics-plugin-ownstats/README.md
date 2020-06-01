<!--
title: Ownstats
description: Using the ownstats plugin
-->
# Ownstats plugin for `analytics`

Integration with [Ownstats](https://ownstats.cloud/) for [analytics](https://www.npmjs.com/package/analytics)

For more information [see the docs](https://getanalytics.io/plugins/ownstats/).

<!-- AUTO-GENERATED-CONTENT:START (TOC:collapse=true&collapseText=Click to expand) -->
<details>
<summary>Click to expand</summary>

- [Installation](#installation)
- [How to use](#how-to-use)
- [Platforms Supported](#platforms-supported)
- [Browser usage](#browser-usage)
  * [Browser API](#browser-api)
  * [Configuration options for browser](#configuration-options-for-browser)
- [Server-side usage](#server-side-usage)
  * [Server-side API](#server-side-api)
  * [Configuration options for server-side](#configuration-options-for-server-side)
- [Additional examples](#additional-examples)

</details>
<!-- AUTO-GENERATED-CONTENT:END -->

## Installation

```bash
npm install analytics
npm install @analytics/ownstats
```

<!-- AUTO-GENERATED-CONTENT:START (PLUGIN_DOCS) -->

## How to use

The `@analytics/ownstats` package works in [the browser](#browser-usage) and [server-side in Node.js](#server-side-usage). To use, install the package, include in your project and initialize the plugin with [analytics](https://www.npmjs.com/package/analytics).

Below is an example of how to use the browser plugin.

```js
import Analytics from 'analytics'
import ownstatsPlugin from '@analytics/ownstats'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    ownstatsPlugin({
      /* Use your Ownstats endpoint */
      endpoint: 'sdf76sd7f68sd.cloudfront.net'
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

After initializing `analytics` with the `ownstatsPlugin` plugin, data will be sent into Ownstats whenever [analytics.page](https://getanalytics.io/api/#analyticspage), [analytics.track](https://getanalytics.io/api/#analyticstrack) are called. [analytics.identify](https://getanalytics.io/api/#analyticsidentify) is not supported by Ownstats, as it doesn't use personal identifiable information.

See [additional implementation examples](#additional-examples) for more details on using in your project.

## Platforms Supported

The `@analytics/ownstats` package works in [the browser](#browser-usage) and [server-side in Node.js](#server-side-usage)

## Browser usage

The Ownstats client side browser plugin works with these analytic api methods:

- **[analytics.page](https://getanalytics.io/api/#analyticspage)** - Sends page views into Ownstats 
- **[analytics.track](https://getanalytics.io/api/#analyticstrack)** - Track custom events and send to Ownstats
- **[analytics.reset](https://getanalytics.io/api/#analyticsreset)** - Reset browser storage cookies & localstorage for Ownstats values 

### Browser API

```js
import Analytics from 'analytics'
import ownstatsPlugin from '@analytics/ownstats'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    ownstatsPlugin({
      /* Use your Ownstats endpoint */
      endpoint: 'sdf76sd7f68sd.cloudfront.net'
    })
  ]
})

```

### Configuration options for browser

| Option | description |
|:---------------------------|:-----------|
| `endpoint` <br/>**required** - string| Your ownstats endpoint (e.g. `sdf76sd7f68sd.cloudfront.net`) |
| `useAutomation` <br/>_optional_ - boolean| Enable automatic page view triggering (default: `false`) |
| `debug` <br/>_optional_ - boolean| Enable debug mode, will also trigger events when running on `localhost` (default: `false`) |

## Server-side usage

The Ownstats server-side node.js plugin works with these analytic api methods:

- **[analytics.page](https://getanalytics.io/api/#analyticspage)** - Sends page views into Ownstats 
- **[analytics.track](https://getanalytics.io/api/#analyticstrack)** - Track custom events and send to Ownstats

### Server-side API

```js
import Analytics from 'analytics'
import ownstatsPlugin from '@analytics/ownstats'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    ownstatsPlugin({
      /* Use your Ownstats endpoint */
      endpoint: 'sdf76sd7f68sd.cloudfront.net'
    })
  ]
})

```

### Configuration options for server-side

| Option | description |
|:---------------------------|:-----------|
| `endpoint` <br/>**required** - string| Your Ownstats endpoint |


## Additional examples

Below are additional implementation examples.

<details>
  <summary>Server-side ES6</summary>

  ```js
  import Analytics from 'analytics'
  import ownstatsPlugin from '@analytics/ownstats'

  const analytics = Analytics({
    app: 'awesome-app',
    plugins: [
      ownstatsPlugin({
        /* Use your Ownstats endpoint */
        endpoint: 'sdf76sd7f68sd.cloudfront.net'
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
  const ownstatsPlugin = require('@analytics/ownstats').default

  const analytics = analyticsLib({
    app: 'my-app-name',
    plugins: [
      ownstatsPlugin({
        /* Use your Ownstats endpoint */
        endpoint: 'sdf76sd7f68sd.cloudfront.net'
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
      <title>Using @analytics/ownstats in HTML</title>
      <script src="https://unpkg.com/analytics/dist/analytics.min.js"></script>
      <script src="https://unpkg.com/@analytics/ownstats/dist/@analytics/ownstats.min.js"></script>
      <script type="text/javascript">
        /* Initialize analytics */
        var Analytics = _analytics.init({
          app: 'my-app-name',
          plugins: [
            ownstatsPlugin({
              /* Use your Ownstats endpoint */
              endpoint: 'sdf76sd7f68sd.cloudfront.net'
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

  Using `@analytics/ownstats` in ESM modules.

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/ownstats in HTML via ESModules</title>
      <script>
        // Polyfill process.
        // **Note**: Because `import`s are hoisted, we need a separate, prior <script> block.
        window.process = window.process || { env: { NODE_ENV: 'production' } }
      </script>
      <script type="module">
        import analytics from 'https://unpkg.com/analytics/lib/analytics.browser.es.js?module'
        import ownstatsPlugin from 'https://unpkg.com/@analytics/ownstats/lib/analytics-plugin-ownstats.browser.es.js?module'
        /* Initialize analytics */
        const Analytics = analytics({
          app: 'analytics-html-demo',
          debug: true,
          plugins: [
            ownstatsPlugin({
              /* Use your Ownstats endpoint */
              endpoint: 'sdf76sd7f68sd.cloudfront.net'
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

See the [full list of analytics provider plugins](https://getanalytics.io/plugins/) in the main repo.
