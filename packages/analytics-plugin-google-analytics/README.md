# Google Analytics

This library exports the `google-analytics` plugin for the [`analytics`](https://www.npmjs.com/package/analytics) package & standalone methods for any project to use to make it easier to interact with [Google Analytics](https://analytics.google.com/analytics/web/).

For more information [see the docs](https://getanalytics.io/plugins/google-analytics/).

<!-- AUTO-GENERATED-CONTENT:START (TOC:collapse=true&collapseText=Click to expand) -->
<details>
<summary>Click to expand</summary>

- [Installation](#installation)
- [Platforms Supported](#platforms-supported)
- [Usage](#usage)
  * [Browser](#browser)
  * [Server-side](#server-side)
  * [Additional Usage Examples](#additional-usage-examples)
  * [Customizing event payloads](#customizing-event-payloads)
- [Using as a standalone package](#using-as-a-standalone-package)
  * [Installation](#installation-1)
  * [Using in your app](#using-in-your-app)

</details>
<!-- AUTO-GENERATED-CONTENT:END -->

## Installation

```bash
npm install analytics
npm install @analytics/google-analytics
```

<!-- AUTO-GENERATED-CONTENT:START (PLUGIN_DOCS) -->

## Platforms Supported

The `@analytics/google-analytics` package works in [the browser](#browser) and [server-side in node.js](#server-side)

## Usage

To use the `@analytics/google-analytics` package install in your project and initialize the plugin with [analytics](https://www.npmjs.com/package/analytics).

Below is an example of how to use the browser plugin.

```js
import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    googleAnalytics({
      trackingId: '123-xyz'
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

After initializing `analytics` with the `googleAnalytics` plugin, data will be sent into Google Analytics whenever [analytics.page](https://getanalytics.io/api/#analyticspage), [analytics.track](https://getanalytics.io/api/#analyticstrack), or [analytics.identify](https://getanalytics.io/api/#analyticsidentify) are called.

See [additional implementation examples](#additional-usage-examples) for more details on using in your project.

### Browser

The browser side Google Analytics plugin works with these api methods:

- **[page](https://getanalytics.io/api/#analyticspage)** - Sends page views into Google Analytics 
- **[track](https://getanalytics.io/api/#analyticstrack)** - Track custom events and send to Google Analytics 
- **[identify](https://getanalytics.io/api/#analyticsidentify)** - Identify visitors and send details to Google Analytics 

**Arguments**

- **pluginConfig** `object` Plugin settings
- **pluginConfig.trackingId** `string` site tracking Id

**Example**

```js
googleAnalytics({
  trackingId: '123-xyz'
})
```

### Server-side

The server-side Node.js side Google Analytics plugin works with these api methods:

- **[page](https://getanalytics.io/api/#analyticspage)** - Sends page views into Google Analytics 
- **[track](https://getanalytics.io/api/#analyticstrack)** - Track custom events and send to Google Analytics 
- **[identify](https://getanalytics.io/api/#analyticsidentify)** - Identify visitors and send details to Google Analytics 

**Arguments**

- **pluginConfig** `object` Plugin settings
- **pluginConfig.trackingId** `string` site tracking Id

**Example**

```js
googleAnalytics({
  trackingId: '123-xyz'
})
```


### Additional Usage Examples

<details>
  <summary>Server-side ES6</summary>

  ```js
  import Analytics from 'analytics'
  import googleAnalytics from '@analytics/google-analytics'

  const analytics = Analytics({
    app: 'awesome-app',
    plugins: [
      googleAnalytics({
        trackingId: '123-xyz'
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
  const googleAnalytics = require('@analytics/google-analytics').default

  const analytics = analyticsLib({
    app: 'my-app-name',
    plugins: [
      googleAnalytics({
        trackingId: '123-xyz'
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
      <title>Using @analytics/google-analytics in HTML</title>
      <script src="https://unpkg.com/analytics/dist/analytics.min.js"></script>
      <script src="https://unpkg.com/@analytics/google-analytics/dist/@analytics/google-analytics.min.js"></script>
      <script type="text/javascript">
        /* Initialize analytics */
        var Analytics = _analytics.init({
          app: 'my-app-name',
          plugins: [
            analyticsGA.init({
              trackingId: '123-xyz'
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

  Using `@analytics/google-analytics` in ESM(odules).

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/google-analytics in HTML via ESModules</title>
      <script>
        // Polyfill process.
        // **Note**: Because `import`s are hoisted, we need a separate, prior <script> block.
        window.process = window.process || { env: { NODE_ENV: 'production' } }
      </script>
      <script type="module">
        import analytics from 'https://unpkg.com/analytics/lib/analytics.browser.es.js?module'
        import analyticsGA from 'https://unpkg.com/@analytics/google-analytics/lib/analytics-plugin-ga.browser.es.js?module'
        /* Initialize analytics */
        const Analytics = analytics({
          app: 'analytics-html-demo',
          debug: true,
          plugins: [
            analyticsGA({
              trackingId: '123-xyz'
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


### Customizing event payloads

To send tracking custom events to Google Analytics with `eventLabel`, `eventCategory`, and `eventValue` [fields](https://developers.google.com/analytics/devguides/collection/analyticsjs/events#event_fields), add the `label`, `category`, and `value` keys to the event properties.

```js
analytics.track('play', {
  category: 'Videos',
  label: 'Fall Campaign',
  value: 42
})
```

## Using as a standalone package

This package exports Google Analytics helper methods for any project to use.

**Note:** We recommend using the plugin described above with the `analytics` core package.

The standalone methods below will send data to Google Analytics but are not attached to the [analytics plugin lifecycle](https://getanalytics.io/lifecycle/).

Use `analytics` + `@analytics/google-analytics` packages together as described above to enable these features:

- automatic library initialization
- offline retries
- middleware functionality
- callbacks
- listeners
- etc.

When using `standalone` methods, you will need to handle these edge cases & retries yourself.

### Installation

Install the `@analytics/google-analytics` package.

```bash
npm install @analytics/google-analytics
```

### Using in your app

When using `standalone` mode, you will need to initialize the provider javascript and pass in all the fields needed by said provider.

```js
// Stand alone functionality
import {
  initialize as loadGoogleAnalytics,
  page as pageView,
  track as trackEvent,
  identify as identifyVisitor
} from '@analytics/google-analytics'

// Load Google Analytics on page
loadGoogleAnalytics({ trackingId: 'UA-1234' })

// Track page view
pageView()

// Track custom event
trackEvent('buttonClick', {
  label: 'event label',
  category: 'event category',
  value: 'event value'
})

// Identify the visitor
identifyVisitor('user-123')
```

**Tip**: The benefit of using with the `@analytics/google-analytics` as an `analytics` plugin is not having to update many places in your code when adding or removing an analytics tool. This make refactoring and responding to new business requirements much easier.
