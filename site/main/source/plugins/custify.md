---
title: Custify
description: Using the Custify analytics plugin
---

Integration with Custify for [analytics](https://www.npmjs.com/package/analytics)

This analytics plugin will load Custify's client side tracking script into your application and send custom events, page views, and identify visitors inside Custify.

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
- [Using identify](#using-identify)

</details>
<!-- AUTO-GENERATED-CONTENT:END (TOC) -->

## Installation

Install `analytics` and `@analytics/custify` packages

```bash
npm install analytics
npm install @analytics/custify
```

<!-- AUTO-GENERATED-CONTENT:START (PLUGIN_DOCS) -->

## How to use

The `@analytics/custify` package works in [the browser](#browser-usage) and [server-side in Node.js](#server-side-usage). To use, install the package, include in your project and initialize the plugin with [analytics](https://www.npmjs.com/package/analytics).

Below is an example of how to use the browser plugin.

```js
import Analytics from 'analytics'
import custifyPlugin from '@analytics/custify'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    // This will load crazy egg on to the page
    custifyPlugin({
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

After initializing `analytics` with the `custifyPlugin` plugin, data will be sent into Custify whenever [analytics.page](https://getanalytics.io/api/#analyticspage), [analytics.track](https://getanalytics.io/api/#analyticstrack), or [analytics.identify](https://getanalytics.io/api/#analyticsidentify) are called.

See [additional implementation examples](#additional-examples) for more details on using in your project.

## Platforms Supported

The `@analytics/custify` package works in [the browser](#browser-usage) and [server-side in Node.js](#server-side-usage)

## Browser usage

The Custify client side browser plugin works with these analytic api methods:

- **[analytics.identify](https://getanalytics.io/api/#analyticsidentify)** - Identify visitors and send details to Custify
- **[analytics.page](https://getanalytics.io/api/#analyticspage)** - Sends page views into Custify
- **[analytics.track](https://getanalytics.io/api/#analyticstrack)** - Track custom events and send to Custify

### Browser API

```js
import Analytics from 'analytics'
import custifyPlugin from '@analytics/custify'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    // This will load crazy egg on to the page
    custifyPlugin({
      accountId: '1234578'
    })
  ]
})

```

### Configuration options for browser

| Option | description |
|:---------------------------|:-----------|
| `accountId` <br/>**required** - string| custify account ID |
| `scriptInclude` <br/>_optional_ - boolean| Load custify script into page |
| `options` <br/>_optional_ - object| Custify script options |

## Server-side usage

The Custify server-side node.js plugin works with these analytic api methods:

- **[analytics.page](https://getanalytics.io/api/#analyticspage)** - Sends page views into Custify
- **[analytics.track](https://getanalytics.io/api/#analyticstrack)** - Track custom events and send to Custify
- **[analytics.identify](https://getanalytics.io/api/#analyticsidentify)** - Identify visitors and send details to Custify

### Server-side API

```js
import Analytics from 'analytics'
import custifyPlugin from '@analytics/custify'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    custifyPlugin({
      apiKey: 'abc123'
    })
  ]
})

```

### Configuration options for server-side

| Option | description |
|:---------------------------|:-----------|
| `apiKey` <br/>**required** - string| custify API key |

## Additional examples

Below are additional implementation examples.

<details>
  <summary>Server-side ES6</summary>

  ```js
  import Analytics from 'analytics'
  import custifyPlugin from '@analytics/custify'

  const analytics = Analytics({
    app: 'awesome-app',
    plugins: [
      custifyPlugin({
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
  const custifyPlugin = require('@analytics/custify').default

  const analytics = analyticsLib({
    app: 'my-app-name',
    plugins: [
      custifyPlugin({
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
      <title>Using @analytics/custify in HTML</title>
      <script src="https://unpkg.com/analytics/dist/analytics.min.js"></script>
      <script src="https://unpkg.com/@analytics/custify/dist/@analytics/custify.min.js"></script>
      <script type="text/javascript">
        /* Initialize analytics */
        var Analytics = _analytics.init({
          app: 'my-app-name',
          plugins: [
            // This will load crazy egg on to the page
            analyticsCustify({
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

  Using `@analytics/custify` in ESM modules.

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/custify in HTML via ESModules</title>
      <script>
        // Polyfill process.
        // **Note**: Because `import`s are hoisted, we need a separate, prior <script> block.
        window.process = window.process || { env: { NODE_ENV: 'production' } }
      </script>
      <script type="module">
        import analytics from 'https://unpkg.com/analytics/lib/analytics.browser.es.js?module'
        import analyticsCustify from 'https://unpkg.com/@analytics/custify/lib/analytics-plugin-custify.browser.es.js?module'
        /* Initialize analytics */
        const Analytics = analytics({
          app: 'analytics-html-demo',
          debug: true,
          plugins: [
            // This will load crazy egg on to the page
            analyticsCustify({
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

## Using identify

**Important:** Custify requires an `email` field for making identify calls.

If your identify call does not contain `email` Custify will not be notified of the new user.

When sending properties with `identify` calls, all `camelCase` traits are automatically converted to `snake_case`. There is one exception to this for `firstName` & `lastName` which are sent as `firstname` & `lastname`.

**Example:**

```js
analytics.identify('user-xzy-123', {
  email: 'bill@murray.com',
  accountLevel: 'pro' // trait will be `account_level`
})
```
