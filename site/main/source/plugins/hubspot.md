---
title: HubSpot
description: Using the HubSpot analytics plugin
---

Integration with HubSpot for [analytics](https://www.npmjs.com/package/analytics)

This analytics plugin will load HubSpot's client side tracking script into your application and send custom events, page views, and identify visitors inside HubSpot.

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
- [Using identify](#using-identify)

</details>
<!-- AUTO-GENERATED-CONTENT:END (TOC) -->

## Installation

Install `analytics` and `@analytics/hubspot` packages

```bash
npm install analytics
npm install @analytics/hubspot
```

<!-- AUTO-GENERATED-CONTENT:START (PLUGIN_DOCS) -->

## How to use

The `@analytics/hubspot` package works in [the browser](#browser-usage). To use, install the package, include in your project and initialize the plugin with [analytics](https://www.npmjs.com/package/analytics).

Below is an example of how to use the browser plugin.

```js
import Analytics from 'analytics'
import hubSpotPlugin from '@analytics/hubspot'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    hubSpotPlugin({
      portalId: '234576'
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
analytics.identify({
  name: 'bob',
  email: 'bob@bob.com' // email is required
})

```

After initializing `analytics` with the `hubSpotPlugin` plugin, data will be sent into HubSpot whenever [analytics.identify](https://getanalytics.io/api/#analyticsidentify), [analytics.page](https://getanalytics.io/api/#analyticspage), or [analytics.track](https://getanalytics.io/api/#analyticstrack) are called.

See [additional implementation examples](#additional-examples) for more details on using in your project.

## Platforms Supported

The `@analytics/hubspot` package works in [the browser](#browser-usage)

## Browser usage

The HubSpot client side browser plugin works with these analytic api methods:

- **[analytics.identify](https://getanalytics.io/api/#analyticsidentify)** - Identify visitors and send details to HubSpot
- **[analytics.page](https://getanalytics.io/api/#analyticspage)** - Sends page views into HubSpot
- **[analytics.track](https://getanalytics.io/api/#analyticstrack)** - Track custom events and send to HubSpot
- **[analytics.reset](https://getanalytics.io/api/#analyticsreset)** - Reset browser storage cookies & localstorage for HubSpot values

### Browser API

```js
import Analytics from 'analytics'
import hubSpotPlugin from '@analytics/hubspot'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    hubSpotPlugin({
      portalId: '234576'
    })
  ]
})

```

### Configuration options for browser

| Option | description |
|:---------------------------|:-----------|
| `portalId` <br/>**required** - string| The HubSpot Portal (or Hub) Id of your HubSpot account |
| `customScriptSrc` <br/>_optional_ - string| Load hubspot script from custom source |
| `flushOnIdentify` <br/>_optional_ - boolean| Fire immediate page view to send identify information |

## Additional examples

Below are additional implementation examples.

<details>
  <summary>Using in HTML</summary>

  Below is an example of importing via the unpkg CDN. Please note this will pull in the latest version of the package.

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/hubspot in HTML</title>
      <script src="https://unpkg.com/analytics/dist/analytics.min.js"></script>
      <script src="https://unpkg.com/@analytics/hubspot/dist/@analytics/hubspot.min.js"></script>
      <script type="text/javascript">
        /* Initialize analytics */
        var Analytics = _analytics.init({
          app: 'my-app-name',
          plugins: [
            analyticsHubspot({
              portalId: '234576'
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
        analytics.identify({
          name: 'bob',
          email: 'bob@bob.com' // email is required
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

  Using `@analytics/hubspot` in ESM modules.

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/hubspot in HTML via ESModules</title>
      <script>
        // Polyfill process.
        // **Note**: Because `import`s are hoisted, we need a separate, prior <script> block.
        window.process = window.process || { env: { NODE_ENV: 'production' } }
      </script>
      <script type="module">
        import analytics from 'https://unpkg.com/analytics/lib/analytics.browser.es.js?module'
        import analyticsHubspot from 'https://unpkg.com/@analytics/hubspot/lib/analytics-plugin-hubspot.browser.es.js?module'
        /* Initialize analytics */
        const Analytics = analytics({
          app: 'analytics-html-demo',
          debug: true,
          plugins: [
            analyticsHubspot({
              portalId: '234576'
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
        analytics.identify({
          name: 'bob',
          email: 'bob@bob.com' // email is required
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

**Important:** HubSpot requires an `email` field for making identify calls.

If your identify call does not contain `email` HubSpot will not be notified of the new user.

When sending properties with `identify` calls, all `camelCase` traits are automatically converted to `snake_case`. There is one exception to this for `firstName` & `lastName` which are sent as `firstname` & `lastname`.

**Example:**

```js
analytics.identify('user-xzy-123', {
  email: 'bill@murray.com',
  accountLevel: 'pro' // trait will be `account_level`
})
```
