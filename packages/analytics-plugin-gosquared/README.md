<!--
title: GoSquared
description: Using the GoSquared plugin
-->
# GoSquared Plugin for `analytics`

Integration with [GoSquared](https://www.gosquared.com/) for [analytics](https://www.npmjs.com/package/analytics)

GoSquared adds heat mapping, A/B testing, and session recording functionality to websites and applications. This allows developers, marketers, and product owners to see what is working and what areas of an application might need improvements.

This analytics plugin will load GoSquared into your application.

[View the docs](https://getanalytics.io/plugins/gosquared/).

<!-- AUTO-GENERATED-CONTENT:START (TOC:collapse=true&collapseText=Click to expand) -->
<details>
<summary>Click to expand</summary>

- [GoSquared Plugin for `analytics`](#gosquared-plugin-for-analytics)
  - [Installation](#installation)
  - [How to use](#how-to-use)
  - [Browser usage](#browser-usage)
    - [Browser API](#browser-api)
  - [Platforms Supported](#platforms-supported)
  - [Additional examples](#additional-examples)
  - [Usage](#usage)

</details>
<!-- AUTO-GENERATED-CONTENT:END -->

## Installation

Install `analytics` and `@analytics/gosquared` packages

```bash
npm install analytics
npm install @analytics/gosquared
```

<!-- AUTO-GENERATED-CONTENT:START (PLUGIN_DOCS) -->

## How to use

The `@analytics/gosquared` package works in [the browser](#browser-usage). To use, install the package, include in your project and initialize the plugin with [analytics](https://www.npmjs.com/package/analytics).

Below is an example of how to use the browser plugin.

```js
import Analytics from 'analytics'
import exports from '@analytics/gosquared'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    // This will load GoSquared on to the page
    goSquared({
      projectToken: 'GSN-123456-A'
    })
  ]
})

```

See [additional implementation examples](#additional-examples) for more details on using in your project.

## Browser usage

See below from browser API

### Browser API

```js
const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    // This will load GoSquared on to the page
    goSquared({
      projectToken: 'GSN-123456-A'
    })
  ]
})

```

**Initialization arguments**

- **pluginConfig** `object` Plugin settings
- **pluginConfig.projectToken** `string` GoSquared project token


## Platforms Supported

The `@analytics/gosquared` package works in [the browser](#browser-usage)

## Additional examples

Below are additional implementation examples.

<details>
  <summary>Using in HTML</summary>

  Below is an example of importing via the unpkg CDN. Please note this will pull in the latest version of the package.

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/gosquared in HTML</title>
      <script src="https://unpkg.com/analytics/dist/analytics.min.js"></script>
      <script src="https://unpkg.com/@analytics/gosquared/dist/@analytics/gosquared.min.js"></script>
      <script type="text/javascript">
        /* Initialize analytics */
        var Analytics = _analytics.init({
          app: 'my-app-name',
          plugins: [
            // This will load GoSquared on to the page
            goSquared({
              projectToken: 'GSN-123456-A'
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

  Using `@analytics/gosquared` in ESM modules.

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/gosquared in HTML via ESModules</title>
      <script>
        // Polyfill process.
        // **Note**: Because `import`s are hoisted, we need a separate, prior <script> block.
        window.process = window.process || { env: { NODE_ENV: 'production' } }
      </script>
      <script type="module">
        import analytics from 'https://unpkg.com/analytics/lib/analytics.browser.es.js?module'
        import analyticsGoSquared from 'https://unpkg.com/@analytics/gosquared/lib/analytics-plugin-gosquared.browser.es.js?module'
        /* Initialize analytics */
        const Analytics = analytics({
          app: 'analytics-html-demo',
          debug: true,
          plugins: [
            // This will load GoSquared on to the page
            goSquared({
              projectToken: 'GSN-123456-A'
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

## Grabbing your projectToken

Inside of the gosquared admin panel you can find your tracking ID in the URL of the dashboard.

![image](https://user-images.githubusercontent.com/532272/70370383-9a7abb00-187b-11ea-8fc7-97584d5ba8c2.png)

It's also visible in the tracking code

![image](https://user-images.githubusercontent.com/532272/70370401-b7af8980-187b-11ea-9f2b-dfac31b427af.png)

Take the `projectToken` value and use it in the initialization of the plugin
