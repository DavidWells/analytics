---
title: Sending performance data to any third party analytics provider
description: Sending page performance metrics to any analytics provider
pageTitle: Perfume.js
---

Send performance metrics to any analytics provider using [perfume.js](https://zizzamia.github.io/perfume/).

Perfume is a tiny, web performance monitoring library that reports field data back to your favorite analytics tool.

Using perfume.js with `analytics` makes wiring up your performances metrics to any third-party analytics tool nice & easy.

<!-- AUTO-GENERATED-CONTENT:START (TOC:collapse=true&collapseText=Click to expand) -->
<details>
<summary>Click to expand</summary>

- [Installation](#installation)
- [How to use](#how-to-use)
- [Configuration options](#configuration-options)
- [Additional examples](#additional-examples)
- [Zero config](#zero-config)
- [Demo Video](#demo-video)

</details>
<!-- AUTO-GENERATED-CONTENT:END -->

## Installation

```bash
npm install analytics
npm install @analytics/perfumejs
npm install perfume.js
```

## How to use

The `@analytics/perfumejs` package works in the browser to collect and send performance data to any third party analytics tool.

To use, install the package, include in your project and initialize the plugin with analytics.

By default, the perfume.js plugin will send performance metrics to all analytics plugins attached to `analytics`. You can customize this & disable specific providers with the optional `destinations` config setting.

Below is an example of how to use the browser plugin.

```js
import Analytics from 'analytics'
import customerIOPlugin from '@analytics/customerio'
import googleAnalytics from '@analytics/google-analytics'
import hubSpotPlugin from '@analytics/hubspot'
// Include perfume.js analytics plugin
import perfumePlugin from '@analytics/perfumejs'
// Include perfume.js library
import Perfume from 'perfume.js'

const analytics = Analytics({
  app: 'my-app',
  plugins: [
    // Attach Google analytics
    googleAnalytics({
      trackingId: 'UA-12341131-6',
      instanceName: 'two'
    })
    // Attach Hubspot analytics
    hubSpotPlugin({
      portalId: '234576'
    }),
    // Attach Customer.io analytics
    customerIOPlugin({
      siteId: '123-xyz'
    })
    /* Include perfume.js plugin */
    perfumePlugin({
      // Perfume.js class. If empty, window.Perfume will be used.
      perfume: Perfume,
      // Analytics providers to send performance data.
      destinations: {
        // perf data will sent to Google Analytics
        'google-analytics': true,
        // perf data will sent to Customer.io
        'customerio': true,
        // perf will NOT be sent to HubSpot
        'hubspot': false
      },
    }),
  ]
})

/* Perfume.js will now automatically sent performance data
to Google Analytics and Customer.io 🎉 */
```

See [additional implementation examples](#additional-examples) for more details on using in your project.

## Configuration options

| Option | description |
|:---------------------------|:-----------|
| `perfume` <br/>_optional_ - object| perfume.js class. If not provided, a global window reference to Perfume will be used |
| `destinations` <br/>_optional_ - object| Where perfume.js will send performance data |
| `category` <br/>_optional_ - string| Name of event category. Default 'perfume.js' |
| `perfumeOptions` <br/>_optional_ - object| Options to pass to perfume.js instance. See https://github.com/Zizzamia/perfume.js#perfume-custom-options |

For more in how `destinations` option works, see [sending provider-specific events docs
](https://getanalytics.io/tutorials/sending-provider-specific-events/).

```js
perfumePlugin({
  perfume: Perfume,
  destinations: { all: true } // <-- default value to send to all plugins
})
```

Disable all and only send to specific plugins

```js
perfumePlugin({
  perfume: Perfume,
  destinations: {
    all: false,
    'hubspot': true, // <--- these are the plugin 'name' properties
    'google-analytics': true // <--- these are the plugin 'name' properties
  }
})
```

## Additional examples

Below are additional implementation examples.

<details>
  <summary>Using in HTML</summary>

  Below is an example of importing via the unpkg CDN. Please note this will pull in the latest version of the package.

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/perfumejs in HTML</title>
      <script src="https://unpkg.com/analytics/dist/analytics.min.js"></script>
      <script src="https://unpkg.com/perfume.js"></script>
      <script src="https://unpkg.com/@analytics/perfumejs/dist/@analytics/perfumejs.min.js"></script>
      <script type="text/javascript">
        /* Initialize analytics */
        var Analytics = _analytics.init({
          app: 'my-app-name',
          plugins: [
            analyticsPerfumeJs({
              perfume: Perfume,
              category: 'perfMetrics'
            })
          ]
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

  Using `@analytics/perfumejs` in ESM modules.

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/perfumejs in HTML via ESModules</title>
      <script>
        // Polyfill process.
        // **Note**: Because `import`s are hoisted, we need a separate, prior <script> block.
        window.process = window.process || { env: { NODE_ENV: 'production' } }
      </script>
      <script type="module">
        import analytics from 'https://unpkg.com/analytics/lib/analytics.browser.es.js?module'
        import Perfume from 'https://unpkg.com/perfume.js?module'
        import analyticsPerfumeJs from 'https://unpkg.com/@analytics/perfumejs/lib/analytics-plugin-perfumejs.browser.es.js?module'
        /* Initialize analytics */
        const Analytics = analytics({
          app: 'analytics-html-demo',
          debug: true,
          plugins: [
            analyticsPerfumeJs({
              perfume: Perfume,
              category: 'perfMetrics'
            })
            // ... add any other third party analytics plugins
          ]
        })
      </script>
    </head>
    <body>
      ....
    </body>
  </html>

  ```

</details>

## Zero config

For ease of use, there is a "zero-config" option where you only need to pass in the `Perfume` class to the analytics plugin. This will automatically send all performance metrics to all attached [analytic plugins](https://getanalytics.io/plugins).

```js
import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'
import hubSpotPlugin from '@analytics/hubspot'
import perfumePlugin from '@analytics/perfumejs'
import Perfume from 'perfume.js'

const analytics = Analytics({
  app: 'my-app',
  plugins: [
    // Attach Google analytics
    googleAnalytics({
      trackingId: 'UA-12341131-6',
      instanceName: 'two'
    })
    // Attach Hubspot analytics
    hubSpotPlugin({
      portalId: '234576'
    }),
    // Include perfume.js plugin with no options set.
    // This will send data to all analytics providers by default
    perfumePlugin(Perfume),
  ]
})
```

## Demo Video

<iframe width="700" height="405" src="https://www.youtube.com/embed/9DZAVpAubtQ" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
