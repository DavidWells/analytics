# Segment plugin for `analytics`

Integration with [segment](https://segment.com/) for [analytics](https://www.npmjs.com/package/analytics)

For more information [see the docs](https://getanalytics.io/plugins/segment/).

<!-- AUTO-GENERATED-CONTENT:START (TOC:collapse=true&collapseText=Click to expand) -->
<details>
<summary>Click to expand</summary>

- [Install](#install)
- [Platforms Supported](#platforms-supported)
- [Usage](#usage)
  * [Browser](#browser)
  * [Server-side](#server-side)
  * [Additional Usage Examples](#additional-usage-examples)

</details>
<!-- AUTO-GENERATED-CONTENT:END -->

## Install

```bash
npm install analytics
npm install @analytics/segment
```

<!-- AUTO-GENERATED-CONTENT:START (PLUGIN_DOCS) -->

## Platforms Supported

The `@analytics/segment` package works in [the browser](#browser) and [server-side in node.js](#server-side)

## Usage

To use the `@analytics/segment` package install in your project and initialize the plugin with [analytics](https://www.npmjs.com/package/analytics).

Below is an example of how to use the browser plugin.

```js
import Analytics from 'analytics'
import segmentPlugin from '@analytics/segment'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    segmentPlugin({
      writeKey: '123-xyz'
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

After initializing `analytics` with the `segmentPlugin` plugin, data will be sent into Segment whenever [analytics.page](https://getanalytics.io/api/#analyticspage), [analytics.track](https://getanalytics.io/api/#analyticstrack), or [analytics.identify](https://getanalytics.io/api/#analyticsidentify) are called.

See [additional implementation examples](#additional-usage-examples) for more details on using in your project.

### Browser

The Segment client side browser plugin works with these api methods:

- **[page](https://getanalytics.io/api/#analyticspage)** - Sends page views into Segment 
- **[track](https://getanalytics.io/api/#analyticstrack)** - Track custom events and send to Segment 
- **[identify](https://getanalytics.io/api/#analyticsidentify)** - Identify visitors and send details to Segment 
- **[reset](https://getanalytics.io/api/#analyticsreset)** - Reset browser storage cookies & localstorage for Segment values 

**Arguments**

- **pluginConfig** `object` Plugin settings
- **pluginConfig.writeKey** `string` Your segment writeKey
- **pluginConfig.disableAnonymousTraffic** (optional) `boolean` Disable loading segment for anonymous visitors

**Example**

```js
segmentPlugin({
  writeKey: '123-xyz'
})
```

### Server-side

The Segment server-side node.js plugin works with these api methods:

- **[page](https://getanalytics.io/api/#analyticspage)** - Sends page views into Segment 
- **[track](https://getanalytics.io/api/#analyticstrack)** - Track custom events and send to Segment 
- **[identify](https://getanalytics.io/api/#analyticsidentify)** - Identify visitors and send details to Segment 

**Arguments**

- **pluginConfig** `object` Plugin settings
- **pluginConfig.writeKey** `string` Your segment writeKey
- **pluginConfig.flushInterval** (optional) `boolean` Segment sdk flushInterval. Docs https://bit.ly/2H2jJMb
- **pluginConfig.disableAnonymousTraffic** (optional) `boolean` Disable loading segment for anonymous visitors

**Example**

```js
segmentPlugin({
  writeKey: '123-xyz'
})
```


### Additional Usage Examples

<details>
  <summary>Server-side ES6</summary>

  ```js
  import Analytics from 'analytics'
  import segmentPlugin from '@analytics/segment'

  const analytics = Analytics({
    app: 'awesome-app',
    plugins: [
      segmentPlugin({
        writeKey: '123-xyz'
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
  <summary>Server-side Node.js common JS</summary>

  ```js
  const analyticsLib = require('analytics').default
  const segmentPlugin = require('@analytics/segment').default

  const analytics = analyticsLib({
    app: 'my-app-name',
    plugins: [
      segmentPlugin({
        writeKey: '123-xyz'
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

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/segment in HTML</title>
      <script src="https://unpkg.com/analytics/dist/analytics.min.js"></script>
      <script src="https://unpkg.com/@analytics/segment/dist/@analytics/segment.min.js"></script>
      <script type="text/javascript">
        /* Initialize analytics */
        var Analytics = _analytics.init({
          app: 'my-app-name',
          plugins: [
            analyticsSegment({
              writeKey: '123-xyz'
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

  Using `@analytics/segment` in ESM(odules).

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/segment in HTML via ESModules</title>
      <script>
        // Polyfill process.
        // **Note**: Because `import`s are hoisted, we need a separate, prior <script> block.
        window.process = window.process || { env: { NODE_ENV: 'production' } }
      </script>
      <script type="module">
        import analytics from 'https://unpkg.com/analytics/lib/analytics.browser.es.js?module'
        import analyticsSegment from 'https://unpkg.com/@analytics/segment/lib/analytics-plugin-segment.browser.es.js?module'
        /* Initialize analytics */
        const Analytics = analytics({
          app: 'analytics-html-demo',
          debug: true,
          plugins: [
            analyticsSegment({
              writeKey: '123-xyz'
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
