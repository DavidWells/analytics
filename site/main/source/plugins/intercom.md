---
title: Intercom
description: Using the intercom plugin
---

Integration with [intercom](https://intercom.com/) for [analytics](https://www.npmjs.com/package/analytics)

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
- [Custom browser methos](#custom-browser-methos)
  - [actions](#actions)
  - [hooks](#hooks)
  - [Browser Example](#browser-example)

</details>
<!-- AUTO-GENERATED-CONTENT:END -->

## Installation

```bash
npm install analytics
npm install @analytics/intercom
```

<!-- AUTO-GENERATED-CONTENT:START (PLUGIN_DOCS) -->

## How to use

The `@analytics/intercom` package works in [the browser](#browser-usage) and [server-side in Node.js](#server-side-usage). To use, install the package, include in your project and initialize the plugin with [analytics](https://www.npmjs.com/package/analytics).

Below is an example of how to use the browser plugin.

```js
import Analytics from 'analytics'
import intercomPlugin from '@analytics/intercom'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    intercomPlugin({
      appId: '123-xyz'
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

After initializing `analytics` with the `intercomPlugin` plugin, data will be sent into Intercom whenever [analytics.page](https://getanalytics.io/api/#analyticspage), [analytics.track](https://getanalytics.io/api/#analyticstrack), or [analytics.identify](https://getanalytics.io/api/#analyticsidentify) are called.

See [additional implementation examples](#additional-examples) for more details on using in your project.

## Platforms Supported

The `@analytics/intercom` package works in [the browser](#browser-usage) and [server-side in Node.js](#server-side-usage)

## Browser usage

The Intercom client side browser plugin works with these analytic api methods:

- **[analytics.page](https://getanalytics.io/api/#analyticspage)** - Sends page views into Intercom
- **[analytics.track](https://getanalytics.io/api/#analyticstrack)** - Track custom events and send to Intercom
- **[analytics.identify](https://getanalytics.io/api/#analyticsidentify)** - Identify visitors and send details to Intercom
- **[analytics.reset](https://getanalytics.io/api/#analyticsreset)** - Reset browser storage cookies & localstorage for Intercom values

### Browser API

```js
import Analytics from 'analytics'
import intercomPlugin from '@analytics/intercom'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    intercomPlugin({
      appId: '123-xyz'
    })
  ]
})

```

### Configuration options for browser

| Option | description |
|:---------------------------|:-----------|
| `appId` <br/>**required** - string| Your intercom app id |
| `disableAnonymousTraffic` <br/>_optional_ - boolean| Disable loading intercom for anonymous visitors |
| `alignment` <br/>_optional_ - string| Customize left or right position of messenger |
| `horizontalPadding` <br/>_optional_ - number| Customize horizontal padding |
| `verticalPadding` <br/>_optional_ - number| Customize vertical padding |
| `customLauncherSelector` <br/>_optional_ - string| Css selector of the custom launcher see https://www.intercom.com/help/en/articles/2894-customize-the-intercom-messenger-technical for additional info |

## Server-side usage

The Intercom server-side node.js plugin works with these analytic api methods:

- **[analytics.page](https://getanalytics.io/api/#analyticspage)** - Sends page views into Intercom
- **[analytics.track](https://getanalytics.io/api/#analyticstrack)** - Track custom events and send to Intercom
- **[analytics.identify](https://getanalytics.io/api/#analyticsidentify)** - Identify visitors and send details to Intercom

### Server-side API

```js
import Analytics from 'analytics'
import intercomPlugin from '@analytics/intercom'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    intercomPlugin({
      appId: '123-xyz'
    })
  ]
})

```

### Configuration options for server-side

| Option | description |
|:---------------------------|:-----------|
| `appId` <br/>**required** - string| Your Intercom app id |

## Additional examples

Below are additional implementation examples.

<details>
  <summary>Server-side ES6</summary>

  ```js
  import Analytics from 'analytics'
  import intercomPlugin from '@analytics/intercom'

  const analytics = Analytics({
    app: 'awesome-app',
    plugins: [
      intercomPlugin({
        appId: '123-xyz'
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
  const intercomPlugin = require('@analytics/intercom').default

  const analytics = analyticsLib({
    app: 'my-app-name',
    plugins: [
      intercomPlugin({
        appId: '123-xyz'
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
      <title>Using @analytics/intercom in HTML</title>
      <script src="https://unpkg.com/analytics/dist/analytics.min.js"></script>
      <script src="https://unpkg.com/@analytics/intercom/dist/@analytics/intercom.min.js"></script>
      <script type="text/javascript">
        /* Initialize analytics */
        var Analytics = _analytics.init({
          app: 'my-app-name',
          plugins: [
            analyticsIntercom({
              appId: '123-xyz'
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

  Using `@analytics/intercom` in ESM modules.

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/intercom in HTML via ESModules</title>
      <script>
        // Polyfill process.
        // **Note**: Because `import`s are hoisted, we need a separate, prior <script> block.
        window.process = window.process || { env: { NODE_ENV: 'production' } }
      </script>
      <script type="module">
        import analytics from 'https://unpkg.com/analytics/lib/analytics.browser.es.js?module'
        import analyticsIntercom from 'https://unpkg.com/@analytics/intercom/lib/analytics-plugin-intercom.browser.es.js?module'
        /* Initialize analytics */
        const Analytics = analytics({
          app: 'analytics-html-demo',
          debug: true,
          plugins: [
            analyticsIntercom({
              appId: '123-xyz'
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

## Custom browser methos

This plugin exposes some custom intercom methods thanks to [custom methods](https://getanalytics.io/plugins/writing-plugins/#adding-custom-methods) on plugins.

See [reference api](https://developers.intercom.com/installing-intercom/docs/intercom-javascript) for additional information

### actions

`startTour(tourId)`
`shutdown()`
`hide()`
`show()`
`showMessages()`
`showNewMessage()`

### hooks

The following methods require a function as an argument
`onShow(callback)`
`onUnreadCountChange(callback)`

### Browser Example

```js
import Analytics from "analytics";
import intercomPlugin from "@analytics/intercom";

// Initialize analytics instance with plugins
const analytics = Analytics({
  app: "your-app-name",
  plugins: [
    intercomPlugin({
      appId: "123-xyz",
    }),
  ],
});

// Usage:
// Now you can call intercom.startTour in your app like so
analytics.plugins.intercom.startTour("tourID");

// hook usage:
analytics.plugins.intercom.onShow(() => {
  console.log("fires when intercom launcher is shown");
});
```
