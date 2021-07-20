---
title: Mixpanel
description: Using the Mixpanel analytics plugin
---

Integration with Mixpanel for [analytics](https://www.npmjs.com/package/analytics)

This analytics plugin will load Mixpanel's client side tracking script into your application and send custom events, page views, and identify visitors inside Mixpanel.

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
<!-- AUTO-GENERATED-CONTENT:END (TOC) -->

## Installation

Install `analytics` and `@analytics/mixpanel` packages

```bash
npm install analytics
npm install @analytics/mixpanel
```

<!-- AUTO-GENERATED-CONTENT:START (PLUGIN_DOCS) -->

## How to use

The `@analytics/mixpanel` package works in [the browser](#browser-usage). To use, install the package, include in your project and initialize the plugin with [analytics](https://www.npmjs.com/package/analytics).

Below is an example of how to use the browser plugin.

```js
import Analytics from 'analytics'
import mixpanelPlugin from '@analytics/mixpanel'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    mixpanelPlugin({
      token: 'abcdef123'
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

After initializing `analytics` with the `mixpanelPlugin` plugin, data will be sent into Mixpanel whenever [analytics.identify](https://getanalytics.io/api/#analyticsidentify), [analytics.page](https://getanalytics.io/api/#analyticspage), or [analytics.track](https://getanalytics.io/api/#analyticstrack) are called.

See [additional implementation examples](#additional-examples) for more details on using in your project.

## Platforms Supported

The `@analytics/mixpanel` package works in [the browser](#browser-usage)

## Browser usage

The Mixpanel client side browser plugin works with these analytic api methods:

- **[analytics.identify](https://getanalytics.io/api/#analyticsidentify)** - Identify visitors and send details to Mixpanel
- **[analytics.page](https://getanalytics.io/api/#analyticspage)** - Sends page views into Mixpanel
- **[analytics.track](https://getanalytics.io/api/#analyticstrack)** - Track custom events and send to Mixpanel
- **[analytics.reset](https://getanalytics.io/api/#analyticsreset)** - Reset browser storage cookies & localstorage for Mixpanel values

### Browser API

```js
import Analytics from 'analytics'
import mixpanelPlugin from '@analytics/mixpanel'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    mixpanelPlugin({
      token: 'abcdef123'
    })
  ]
})

```

### Configuration options for browser

| Option | description |
|:---------------------------|:-----------|
| `token` <br/>**required** - string| The mixpanel token associated to a mixpanel project |
| `customScriptSrc` <br/>_optional_ - string| Load mixpanel script from custom source |

## Additional examples

Below are additional implementation examples.

<details>
  <summary>Using in HTML</summary>

  Below is an example of importing via the unpkg CDN. Please note this will pull in the latest version of the package.

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/mixpanel in HTML</title>
      <script src="https://unpkg.com/analytics/dist/analytics.min.js"></script>
      <script src="https://unpkg.com/@analytics/mixpanel/dist/@analytics/mixpanel.min.js"></script>
      <script type="text/javascript">
        /* Initialize analytics */
        var Analytics = _analytics.init({
          app: 'my-app-name',
          plugins: [
            analyticsMixpanel({
              token: 'abcdef123'
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

  Using `@analytics/mixpanel` in ESM modules.

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/mixpanel in HTML via ESModules</title>
      <script>
        // Polyfill process.
        // **Note**: Because `import`s are hoisted, we need a separate, prior <script> block.
        window.process = window.process || { env: { NODE_ENV: 'production' } }
      </script>
      <script type="module">
        import analytics from 'https://unpkg.com/analytics/lib/analytics.browser.es.js?module'
        import analyticsMixpanel from 'https://unpkg.com/@analytics/mixpanel/lib/analytics-plugin-mixpanel.browser.es.js?module'
        /* Initialize analytics */
        const Analytics = analytics({
          app: 'analytics-html-demo',
          debug: true,
          plugins: [
            analyticsMixpanel({
              token: 'abcdef123'
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
