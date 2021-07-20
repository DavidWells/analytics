---
title: CrazyEgg
description: Using the CrazyEgg plugin
---

Integration with [crazy egg](https://www.crazyegg.com/) for [analytics](https://www.npmjs.com/package/analytics)

Crazy egg adds heat mapping, A/B testing, and session recording functionality to websites and applications. This allows developers, marketers, and product owners to see what is working and what areas of an application might need improvements.

This analytics plugin will load crazy egg into your application.

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
- [Usage](#usage)

</details>
<!-- AUTO-GENERATED-CONTENT:END -->

## Installation

Install `analytics` and `@analytics/crazy-egg` packages

```bash
npm install analytics
npm install @analytics/crazy-egg
```

<!-- AUTO-GENERATED-CONTENT:START (PLUGIN_DOCS) -->

## How to use

The `@analytics/crazy-egg` package works in [the browser](#browser-usage). To use, install the package, include in your project and initialize the plugin with [analytics](https://www.npmjs.com/package/analytics).

Below is an example of how to use the browser plugin.

```js
import Analytics from 'analytics'
import exports from '@analytics/crazy-egg'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    // This will load crazy egg on to the page
    crazyEgg({
      accountNumber: '1234578'
    })
  ]
})

```

See [additional implementation examples](#additional-examples) for more details on using in your project.

## Platforms Supported

The `@analytics/crazy-egg` package works in [the browser](#browser-usage)

## Browser usage

See below from browser API

### Browser API

```js
import Analytics from 'analytics'
import exports from '@analytics/crazy-egg'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    // This will load crazy egg on to the page
    crazyEgg({
      accountNumber: '1234578'
    })
  ]
})

```

### Configuration options for browser

| Option | description |
|:---------------------------|:-----------|
| `accountNumber` <br/>**required** - string| crazy egg account ID |

## Additional examples

Below are additional implementation examples.

<details>
  <summary>Using in HTML</summary>

  Below is an example of importing via the unpkg CDN. Please note this will pull in the latest version of the package.

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/crazy-egg in HTML</title>
      <script src="https://unpkg.com/analytics/dist/analytics.min.js"></script>
      <script src="https://unpkg.com/@analytics/crazy-egg/dist/@analytics/crazy-egg.min.js"></script>
      <script type="text/javascript">
        /* Initialize analytics */
        var Analytics = _analytics.init({
          app: 'my-app-name',
          plugins: [
            // This will load crazy egg on to the page
            crazyEgg({
              accountNumber: '1234578'
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

  Using `@analytics/crazy-egg` in ESM modules.

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/crazy-egg in HTML via ESModules</title>
      <script>
        // Polyfill process.
        // **Note**: Because `import`s are hoisted, we need a separate, prior <script> block.
        window.process = window.process || { env: { NODE_ENV: 'production' } }
      </script>
      <script type="module">
        import analytics from 'https://unpkg.com/analytics/lib/analytics.browser.es.js?module'
        import analyticsCrazyEgg from 'https://unpkg.com/@analytics/crazy-egg/lib/analytics-plugin-crazy-egg.browser.es.js?module'
        /* Initialize analytics */
        const Analytics = analytics({
          app: 'analytics-html-demo',
          debug: true,
          plugins: [
            // This will load crazy egg on to the page
            crazyEgg({
              accountNumber: '1234578'
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

<!-- AUTO-GENERATED-CONTENT:END (PLUGIN_DOCS) -->
## Usage

Include `analytics` and `@analytics/crazy-egg` in the source code of your project.

Initialize analytics with the crazy-egg plugin and the crazy-egg heat mapping script will be automatically loaded into the page.

```js
import Analytics from 'analytics'
import crazyEggPlugin from '@analytics/crazy-egg'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    crazyEggPlugin({
      accountNumber: '12345678'
    }),
  ]
})

// Crazy egg now loaded!
```

See the [full list of analytics provider plugins](https://getanalytics.io/plugins/) in the main repo.
