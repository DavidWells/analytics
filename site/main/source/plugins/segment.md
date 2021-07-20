---
title: Segment
description: Using the segment plugin
---

Integration with [segment](https://segment.com/) for [analytics](https://www.npmjs.com/package/analytics)

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
- [Customing the page name field](#customing-the-page-name-field)
- [Loading script from custom proxy](#loading-script-from-custom-proxy)
- [Making group calls](#making-group-calls)
  - [Browser Example](#browser-example)
  - [Server side Example](#server-side-example)

</details>
<!-- AUTO-GENERATED-CONTENT:END -->

## Installation

```bash
npm install analytics
npm install @analytics/segment
```

<!-- AUTO-GENERATED-CONTENT:START (PLUGIN_DOCS) -->

## How to use

The `@analytics/segment` package works in [the browser](#browser-usage) and [server-side in Node.js](#server-side-usage). To use, install the package, include in your project and initialize the plugin with [analytics](https://www.npmjs.com/package/analytics).

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

See [additional implementation examples](#additional-examples) for more details on using in your project.

## Platforms Supported

The `@analytics/segment` package works in [the browser](#browser-usage) and [server-side in Node.js](#server-side-usage)

## Browser usage

The Segment client side browser plugin works with these analytic api methods:

- **[analytics.page](https://getanalytics.io/api/#analyticspage)** - Sends page views into Segment
- **[analytics.track](https://getanalytics.io/api/#analyticstrack)** - Track custom events and send to Segment
- **[analytics.identify](https://getanalytics.io/api/#analyticsidentify)** - Identify visitors and send details to Segment
- **[analytics.reset](https://getanalytics.io/api/#analyticsreset)** - Reset browser storage cookies & localstorage for Segment values

### Browser API

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

```

### Configuration options for browser

| Option | description |
|:---------------------------|:-----------|
| `writeKey` <br/>**required** - string| Your segment writeKey |
| `disableAnonymousTraffic` <br/>_optional_ - boolean| Disable loading segment for anonymous visitors |
| `customScriptSrc` <br/>_optional_ - boolean| Override the Segment snippet url, for loading via custom CDN proxy |
| `integrations` <br/>_optional_ - object| Enable/disable segment destinations https://bit.ly/38nRBj3 |

## Server-side usage

The Segment server-side node.js plugin works with these analytic api methods:

- **[analytics.page](https://getanalytics.io/api/#analyticspage)** - Sends page views into Segment
- **[analytics.track](https://getanalytics.io/api/#analyticstrack)** - Track custom events and send to Segment
- **[analytics.identify](https://getanalytics.io/api/#analyticsidentify)** - Identify visitors and send details to Segment

### Server-side API

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

```

### Configuration options for server-side

| Option | description |
|:---------------------------|:-----------|
| `writeKey` <br/>**required** - string| Your segment writeKey |
| `flushInterval` <br/>_optional_ - boolean| Segment sdk flushInterval. Docs https://bit.ly/2H2jJMb |
| `disableAnonymousTraffic` <br/>_optional_ - boolean| Disable loading segment for anonymous visitors |

## Additional examples

Below are additional implementation examples.

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
  <summary>Server-side Node.js with common JS</summary>

  If using node, you will want to import the `.default`

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

  Below is an example of importing via the unpkg CDN. Please note this will pull in the latest version of the package.

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

  Using `@analytics/segment` in ESM modules.

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

## Customing the page name field

By default the page name is the `document.title` value. 

To have shorter names call page like so:

```js
analytics.page({
  name: 'HomePage'
})
```

This can quickly become tricky to manage and we'd advise against this approach.

## Loading script from custom proxy

In specific scenarios, you might want to load your own version of segment's analytics from a different URL.

To do this, you can add the `customScriptSrc` option pointing to your custom segment script.

```js
import Analytics from 'analytics'
import segmentPlugin from '@analytics/segment'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    segmentPlugin({
      writeKey: '123-xyz',
      // Load segment's analytics.js from somewhere else
      customScriptSrc: 'https://yoursite.com/my-custom-loader.js'
    })
  ]
})
```

## Making group calls

The `.group` call is specific to Segment and the analytics lib doesn't expose this by default. But you are in luck 😃 thanks to [custom methods](https://getanalytics.io/plugins/writing-plugins/#adding-custom-methods) on plugins!

To send a group call to Segment run the `analytics.plugins.segment.group()` custom method.

The `analytics.plugins.segment.group` function has the following signature:

```js
analytics.group(groupId, [traits], [options], [callback]);
```

### Browser Example

```js
import Analytics from 'analytics'
import segmentPlugin from '@analytics/segment'

// Initialize analytics instance with plugins
const analytics = Analytics({
  app: 'your-app-name',
  plugins: [
    segmentPlugin({
      writeKey: '123-xyz'
    }),
  ]
})

// Usage:
// Now you can call segment.group in your app like so
analytics.plugins.segment.group('Group ID XYZ', {
  principles: ['Bill', 'Bob'],
  site: 'Apple co',
  statedGoals: 'Do awesome stuff',
  industry: 'Technology'
})
```

### Server side Example

```js
const analyticsLib = require('analytics').default
const segmentPlugin = require('@analytics/segment')

// Initialize analytics instance with plugins
const analytics = Analytics({
  app: 'your-app-name',
  plugins: [
    segmentPlugin({
      writeKey: '123-xyz'
    }),
  ]
})

analytics.plugins.segment.group('Group ID XYZ', {
  principles: ['Bill', 'Bob'],
  site: 'Apple co',
  statedGoals: 'Do awesome stuff',
  industry: 'Technology'
})
```
