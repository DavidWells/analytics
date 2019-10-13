# FullStory plugin for `analytics`

Integration with [FullStory](https://www.fullstory.com/) for [analytics](https://www.npmjs.com/package/analytics)

[View the docs](https://getanalytics.io/plugins/fullstory/)

<!-- AUTO-GENERATED-CONTENT:START (TOC:collapse=true&collapseText=Click to expand) -->
<details>
<summary>Click to expand</summary>

- [Installation](#installation)
- [How to use](#how-to-use)
- [Browser usage](#browser-usage)
  * [Browser API](#browser-api)
- [Platforms Supported](#platforms-supported)
- [Additional examples](#additional-examples)
- [Formatting Identify & Tracking payloads](#formatting-identify--tracking-payloads)
- [Configuration](#configuration)

</details>
<!-- AUTO-GENERATED-CONTENT:END -->

## Installation

Install `analytics` and `@analytics/customerio` packages

```bash
npm install analytics
npm install @analytics/customerio
```

You will need your `org` ID from [FullStory setting](https://help.fullstory.com/hc/en-us/articles/360020623514-How-do-I-get-FullStory-up-and-running-on-my-site-) to connect to your account and initialize analytics.

To find your FullStory account's `org` ID go to **Settings > FullStory Setup.** and grab the `_fs_org` value.

<!-- AUTO-GENERATED-CONTENT:START (PLUGIN_DOCS) -->

## How to use

The `@analytics/fullstory` package works in [the browser](#browser). To use, install the package, include in your project and initialize the plugin with [analytics](https://www.npmjs.com/package/analytics).

Below is an example of how to use the browser plugin.

```js
import Analytics from 'analytics'
import fullStoryPlugin from '@analytics/fullstory'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    fullStoryPlugin({
      org: 'your-org-name'
    })
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

After initializing `analytics` with the `fullStoryPlugin` plugin, data will be sent into FullStory whenever [analytics.identify](https://getanalytics.io/api/#analyticsidentify), or [analytics.track](https://getanalytics.io/api/#analyticstrack) are called.

See [additional implementation examples](#additional-usage-examples) for more details on using in your project.

## Browser usage

The FullStory client side browser plugin works with these analytic api methods:

- **[analytics.identify](https://getanalytics.io/api/#analyticsidentify)** - Identify visitors and send details to FullStory
- **[analytics.track](https://getanalytics.io/api/#analyticstrack)** - Track custom events and send to FullStory

### Browser API

```js
const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    fullStoryPlugin({
      org: 'your-org-name'
    })
  ]
})

```

**Initialization arguments**

- **pluginConfig** `object` Plugin settings
- **pluginConfig.org** `string` FullStory account's `org` ID. The `_fs_org` value in settings.


## Platforms Supported

The `@analytics/fullstory` package works in [the browser](#browser)

## Additional examples

Below are additional implementation examples.

<details>
  <summary>Using in HTML</summary>

  Below is an example of importing via the unpkg CDN. Please note this will pull in the latest version of the package.

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/fullstory in HTML</title>
      <script src="https://unpkg.com/analytics/dist/analytics.min.js"></script>
      <script src="https://unpkg.com/@analytics/fullstory/dist/@analytics/fullstory.min.js"></script>
      <script type="text/javascript">
        /* Initialize analytics */
        var Analytics = _analytics.init({
          app: 'my-app-name',
          plugins: [
            analyticsFullStory({
              org: 'your-org-name'
            })
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

  Using `@analytics/fullstory` in ESM modules.

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/fullstory in HTML via ESModules</title>
      <script>
        // Polyfill process.
        // **Note**: Because `import`s are hoisted, we need a separate, prior <script> block.
        window.process = window.process || { env: { NODE_ENV: 'production' } }
      </script>
      <script type="module">
        import analytics from 'https://unpkg.com/analytics/lib/analytics.browser.es.js?module'
        import analyticsFullStory from 'https://unpkg.com/@analytics/fullstory/lib/analytics-plugin-fullstory.browser.es.js?module'
        /* Initialize analytics */
        const Analytics = analytics({
          app: 'analytics-html-demo',
          debug: true,
          plugins: [
            analyticsFullStory({
              org: 'your-org-name'
            })
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

Full story requires [specific naming conventions](https://help.fullstory.com/hc/en-us/articles/360020623234) for tracking.

We have taken the liberty of making this easier to use with this plugin. 🎉

Values sent to Full Story will be automatically converted into a values their API will understand.

**Example**

```js
analytics.track('itemPurchased', {
  price: 11.11,
  is_user: true,
  first_name: 'steve'
})
```

This tracking payload will be automatically converted to the [fullstory naming conventions](https://help.fullstory.com/hc/en-us/articles/360020623234) and will be sent like:

```js
FS.event('itemPurchased', {
  price_real: 11.11,
  isUser_bool: true,
  firstName_str: 'steve'
})
```

This will ensure data flows into full story correctly.
