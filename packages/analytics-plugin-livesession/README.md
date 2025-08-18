<!--
title: LiveSession
subTitle: Using the LiveSession analytics plugin
description: Integrate LiveSession visitor tracking with the open source analytics module
-->

# LiveSession plugin for `analytics`

Seamlessly connect [LiveSession](https://www.livesession.io/) with your [analytics](https://www.npmjs.com/package/analytics) implementation

LiveSession empowers you to capture and analyze user interactions within your application. By recording and replaying user sessions, it provides valuable insights that help developers and product teams enhance their software's user experience and functionality.

This plugin seamlessly integrates the LiveSession JavaScript library into your application and enables custom event tracking within LiveSession's ecosystem.

For detailed information about LiveSession's core functionality, explore [the official LiveSession Browser SDK on NPM](https://www.npmjs.com/package/@livesession/browser).

[View the docs](https://getanalytics.io/plugins/livesession/)

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
- [Formatting payloads](#formatting-payloads)

</details>
<!-- AUTO-GENERATED-CONTENT:END -->

## Installation

Install `analytics` and `@analytics/livesession` packages

```bash
npm install analytics
npm install @analytics/livesession
```

You will need your `trackId` from [LiveSession settings](https://livesession.dev/docs/api/browser/introduction) to connect to your account and initialize analytics.

<!-- AUTO-GENERATED-CONTENT:START (PLUGIN_DOCS) -->

## How to use

The `@analytics/livesession` package works in [the browser](#browser-usage). To use, install the package, include in your project and initialize the plugin with [analytics](https://www.npmjs.com/package/analytics).

Below is an example of how to use the browser plugin.

```js
import Analytics from 'analytics'
import livesessionPlugin from '@analytics/livesession'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    livesessionPlugin("your-track-id")
  ]
})

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

After initializing `analytics` with the `livesessionPlugin` plugin, data will be sent into LiveSession whenever [analytics.identify](https://getanalytics.io/api/#analyticsidentify), or [analytics.track](https://getanalytics.io/api/#analyticstrack) are called.

See [additional implementation examples](#additional-examples) for more details on using in your project.

## Platforms Supported

The `@analytics/livesession` package works in [the browser](#browser-usage)

## Browser usage

The LiveSession client side browser plugin works with these analytic api methods:

- **[analytics.identify](https://getanalytics.io/api/#analyticsidentify)** - Identify visitors and send details to LiveSession
- **[analytics.track](https://getanalytics.io/api/#analyticstrack)** - Track custom events and send to LiveSession

### Browser API

```js
import Analytics from 'analytics'
import livesessionPlugin from '@analytics/livesession'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    livesessionPlugin("your-track-id")
  ]
})

```

### Configuration options for browser

| Option | description |
|:---------------------------|:-----------|
| `trackId` <br/>**required** - string| LiveSession website's `trackId` ID. |


## Additional examples

Below are additional implementation examples.

<details>
  <summary>Using in HTML</summary>

  Below is an example of importing via the unpkg CDN. Please note this will pull in the latest version of the package.

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/livesession in HTML</title>
      <script src="https://unpkg.com/analytics/dist/analytics.min.js"></script>
      <script src="https://unpkg.com/@analytics/livesession/dist/@analytics/livesession.min.js"></script>
      <script type="text/javascript">
        /* Initialize analytics */
        var Analytics = _analytics.init({
          app: 'my-app-name',
          plugins: [
            analyticsLiveSession("your-track-id")
          ]
        })

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

  Using `@analytics/livesession` in ESM modules.

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/livesession in HTML via ESModules</title>
      <script>
        // Polyfill process.
        // **Note**: Because `import`s are hoisted, we need a separate, prior <script> block.
        window.process = window.process || { env: { NODE_ENV: 'production' } }
      </script>
      <script type="module">
        import analytics from 'https://unpkg.com/analytics/lib/analytics.browser.es.js?module'
        import analyticsLiveSession from 'https://unpkg.com/@analytics/livesession/lib/analytics-plugin-livesession.browser.es.js?module'
        /* Initialize analytics */
        const Analytics = analytics({
          app: 'analytics-html-demo',
          debug: true,
          plugins: [
            analyticsLiveSession("your-track-id")
            // ... add any other third party analytics plugins
          ]
        })

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

## Formatting payloads

LiveSession requires [specific naming conventions](https://help.livesession.io/en/articles/8496404-custom-events) for tracking.

We have taken the liberty of making this easier to use with this plugin. 🎉

Values sent to LiveSession will be automatically converted into a values their API will understand.

**Example**

```js
analytics.track('itemPurchased', {
  price: 11.11,
  is_user: true,
  first_name: 'steve'
})
```

This tracking payload will be automatically converted to the [livesession naming conventions](https://help.livesession.io/en/articles/8496404-custom-events) and will be sent like:

```js
__ls.event('itemPurchased', {
  price_float: 11.11,
  isUser_bool: true,
  firstName_str: 'steve'
})
```

This will ensure data flows into LiveSession correctly.
