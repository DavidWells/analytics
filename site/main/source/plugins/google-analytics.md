---
title: Adding Google Analytics to your app using open source analytics
description: Connect Google Analytics to the analytics library
pageTitle: Google Analytics
---

This library exports the `google-analytics` plugin for the [`analytics`](https://www.npmjs.com/package/analytics) package & standalone methods for any project to use to make it easier to interact with [Google Analytics](https://analytics.google.com/analytics/web/).

This analytics plugin will load google analytics into your application.

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
- [Anonymize Visitor IPs](#anonymize-visitor-ips)
- [Customizing event payloads](#customizing-event-payloads)
- [Using GA Custom Dimensions](#using-ga-custom-dimensions)
  - [Set the "customDimensions" option](#set-the-customdimensions-option)
- [Using multiple instances](#using-multiple-instances)
- [Custom Proxy Endpoint](#custom-proxy-endpoint)
- [Electron Apps & Browser Extensions](#electron-apps--browser-extensions)
- [Custom GA Tasks](#custom-ga-tasks)
- [Cookie Config](#cookie-config)

</details>
<!-- AUTO-GENERATED-CONTENT:END -->

## Installation

```bash
npm install analytics
npm install @analytics/google-analytics
```

<!-- AUTO-GENERATED-CONTENT:START (PLUGIN_DOCS) -->

## How to use

The `@analytics/google-analytics` package works in [the browser](#browser-usage) and [server-side in Node.js](#server-side-usage). To use, install the package, include in your project and initialize the plugin with [analytics](https://www.npmjs.com/package/analytics).

Below is an example of how to use the browser plugin.

```js
import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    googleAnalytics({
      trackingId: 'UA-1234567'
    })
  ]
})

/* Track a page view */
analytics.page()

/* Track a custom event */
analytics.track('playedVideo', {
  category: 'Videos',
  label: 'Fall Campaign',
  value: 42
})

/* Identify a visitor */
analytics.identify('user-id-xyz', {
  firstName: 'bill',
  lastName: 'murray'
})

```

After initializing `analytics` with the `googleAnalytics` plugin, data will be sent into Google Analytics whenever [analytics.page](https://getanalytics.io/api/#analyticspage), [analytics.track](https://getanalytics.io/api/#analyticstrack), or [analytics.identify](https://getanalytics.io/api/#analyticsidentify) are called.

See [additional implementation examples](#additional-examples) for more details on using in your project.

## Platforms Supported

The `@analytics/google-analytics` package works in [the browser](#browser-usage) and [server-side in Node.js](#server-side-usage)

## Browser usage

The Google Analytics client side browser plugin works with these analytic api methods:

- **[analytics.page](https://getanalytics.io/api/#analyticspage)** - Sends page views into Google Analytics
- **[analytics.track](https://getanalytics.io/api/#analyticstrack)** - Track custom events and send to Google Analytics
- **[analytics.identify](https://getanalytics.io/api/#analyticsidentify)** - Identify visitors and send details to Google Analytics

### Browser API

```js
import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    googleAnalytics({
      trackingId: 'UA-1234567'
    })
  ]
})

```

### Configuration options for browser

| Option | description |
|:---------------------------|:-----------|
| `trackingId` <br/>**required** - string| Google Analytics site tracking Id |
| `debug` <br/>_optional_ - boolean| Enable Google Analytics debug mode |
| `anonymizeIp` <br/>_optional_ - boolean| Enable [Anonymizing IP addresses](https://bit.ly/3c660Rd) sent to Google Analytics. [See details below](#anonymize-visitor-ips) |
| `customDimensions` <br/>_optional_ - object| Map [Custom dimensions](https://bit.ly/3c5de88) to send extra information to Google Analytics. [See details below](#using-ga-custom-dimensions) |
| `resetCustomDimensionsOnPage` <br/>_optional_ - object| Reset custom dimensions by key on analytics.page() calls. Useful for single page apps. |
| `setCustomDimensionsToPage` <br/>_optional_ - boolean| Mapped dimensions will be set to the page & sent as properties of all subsequent events on that page. If false, analytics will only pass custom dimensions as part of individual events |
| `instanceName` <br/>_optional_ - string| Custom tracker name for google analytics. Use this if you need multiple googleAnalytics scripts loaded |
| `customScriptSrc` <br/>_optional_ - string| Custom URL for google analytics script, if proxying calls |
| `cookieConfig` <br/>_optional_ - object| Additional cookie properties for configuring the [ga cookie](https://developers.google.com/analytics/devguides/collection/analyticsjs/cookies-user-id#configuring_cookie_field_settings) |
| `tasks` <br/>_optional_ - object| [Set custom google analytic tasks](https://developers.google.com/analytics/devguides/collection/analyticsjs/tasks) |

## Server-side usage

The Google Analytics server-side node.js plugin works with these analytic api methods:

- **[analytics.page](https://getanalytics.io/api/#analyticspage)** - Sends page views into Google Analytics
- **[analytics.track](https://getanalytics.io/api/#analyticstrack)** - Track custom events and send to Google Analytics
- **[analytics.identify](https://getanalytics.io/api/#analyticsidentify)** - Identify visitors and send details to Google Analytics

### Server-side API

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

```

### Configuration options for server-side

| Option | description |
|:---------------------------|:-----------|
| `trackingId` <br/>**required** - string| Google Analytics site tracking Id |

## Additional examples

Below are additional implementation examples.

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
  <summary>Server-side Node.js with common JS</summary>

  If using node, you will want to import the `.default`

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

  Below is an example of importing via the unpkg CDN. Please note this will pull in the latest version of the package.

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
            analyticsGa.init({
              trackingId: 'UA-1234567'
            })
          ]
        })

        /* Track a page view */
        analytics.page()

        /* Track a custom event */
        analytics.track('playedVideo', {
          category: 'Videos',
          label: 'Fall Campaign',
          value: 42
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

  Using `@analytics/google-analytics` in ESM modules.

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
        import analyticsGa from 'https://unpkg.com/@analytics/google-analytics/lib/analytics-plugin-ga.browser.es.js?module'
        /* Initialize analytics */
        const Analytics = analytics({
          app: 'analytics-html-demo',
          debug: true,
          plugins: [
            analyticsGa({
              trackingId: 'UA-1234567'
            })
            // ... add any other third party analytics plugins
          ]
        })

        /* Track a page view */
        analytics.page()

        /* Track a custom event */
        analytics.track('playedVideo', {
          category: 'Videos',
          label: 'Fall Campaign',
          value: 42
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

## Anonymize Visitor IPs

Google analytics allows you to [anonymize visitor IP addresses](https://developers.google.com/analytics/devguides/collection/analyticsjs/ip-anonymization).

To anonymize the IP addresses of your visitors set the `anonymizeIp` configuration option.

```js
import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'

/* initialize analytics */
const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    googleAnalytics({
      trackingId: 'UA-1223141231',
      /* Anonymize the IP addresses */
      anonymizeIp: true
    }),
  ]
})
```

## Customizing event payloads

To send tracking custom events to Google Analytics with `eventLabel`, `eventCategory`, and `eventValue` [fields](https://developers.google.com/analytics/devguides/collection/analyticsjs/events#event_fields), add the `label`, `category`, and `value` keys to the event properties.

```js
analytics.track('play', {
  category: 'Videos',
  label: 'Fall Campaign',
  value: 42
})
```

## Using GA Custom Dimensions

To use [Google Analytics custom dimensions](https://developers.google.com/analytics/devguides/collection/analyticsjs/custom-dims-mets), use the `customDimensions` configuration option and map the values to the custom dimension slots.

### Set the "customDimensions" option

When initializing `analytics`, make sure you set `customDimensions` and map your values.

```js
import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'

/* initialize analytics */
const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    googleAnalytics({
      trackingId: 'UA-1223141231',
      /* Map your Google Analytics custom dimensions here */
      customDimensions: {
        baz: 'dimension1',
        foo: 'dimension2',
        flam: 'dimension3',
      },
    }),
  ]
})
```

The above config will map **baz** to `dimension1`, **foo** to `dimension2`, and **flam** to `dimension3`

When `track`, `page`, or `identify` calls are made, the mapped values will automatically set to Google Analytics custom dimensions.

```js
/* Tracking example */
analytics.track('buttonClicked', {
   baz: 'hello', // baz is mapped to GA custom dimension "dimension1"
   foo: 'cool'   // foo is mapped to GA custom dimension "dimension2"
})
```

Under the hood, analytics automatically sets the custom dimensions in Google Analytics like so:

```js
window.ga('set', {dimension1: 'hello', dimension2: 'cool'})
```

This also works with page & identify calls.

```js
/* Identify example */
analytics.identify('user123', {
   flam: 'wow' // flam is mapped to GA custom dimension "dimension3"
})

// This is mapped to window.ga('set', {  dimension3: 'wow' })
```

## Using multiple instances

While not advised, it's possible to use [multiple Google Analytics instances](https://developers.google.com/analytics/devguides/collection/analyticsjs/creating-trackers#working_with_multiple_trackers) on a single site.

To use more than one google analytics instance in an app use the `instanceName` config field and make sure to override the default plugin `name`.

Here is an example of using 2 Google Analytics instances in an app.

```js
import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'

// Normal google analytics instance
const instanceOne = googleAnalytics({
  trackingId: '123-xyz',
})

// Second google analytics instance with override for 'name' field of the plugin
const instanceTwo = {
  // initialize the 2nd instance with 'instanceName' field set
  ...googleAnalytics({
    trackingId: '567-abc',
    instanceName: 'two'
  }),
  // change 'name' plugin to avoid namespace collisions
  ...{
    name: 'google-analytics-two'
  }
}

/* Object.assign example
const instanceTwo = Object.assign({}, googleAnalytics({
    trackingId: '567-abc',
    instanceName: 'two'
  }), {
    name: 'google-analytics-two'
  }
}) */

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    // Instance 1 of Google Analytics
    instanceOne,
    // Instance 2 of Google Analytics
    instanceTwo
  ]
})
```

Using the above configuration all tracking, page views, and identify calls will flow into both Google Analytics accounts.

## Custom Proxy Endpoint

In specific [scenarios](https://www.freecodecamp.org/news/save-your-analytics-from-content-blockers-7ee08c6ec7ee/), you might want to load your own version of google analytics to send requests to a proxy.

To do this, you can add the `customScriptSrc` option pointing to your custom Google Analytics script.

```js
import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    googleAnalytics({
      trackingId: '123-xyz',
      customScriptSrc: 'https://my-url.com/to-custom-ga.js'
    })
  ]
})
```

If using a proxied endpoint, it is recommended to combine this technique with the [do-not-track](https://getanalytics.io/plugins/do-not-track/) plugin to ensure website visitors privacy.

## Electron Apps & Browser Extensions

Electron apps bundle and serve their code from the `file://` extension. Likewise, browser extensions serve files from `chrome-extension://`. This causes issues like [this](https://github.com/DavidWells/analytics/issues/77) & [this](https://github.com/DavidWells/analytics/issues/72#issuecomment-681320271) with Google Analytics.

To fix chrome extensions, use the `tasks` configuration and set `checkProtocolTask` to `null`.

To fix electron apps, use the `tasks` configuration option described below and set `checkProtocolTask`, `checkStorageTask`, & `historyImportTask` to `null`.

Here is an example:

```js
import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'

/* initialize analytics and load plugins */
const analytics = Analytics({
  app: 'my-app',
  plugins: [
    googleAnalytics({
      trackingId: '123-xyz',
      // Override or disable GA Tasks https://bit.ly/31Xetmg
      tasks: {
        // Set checkProtocolTask, checkStorageTask, & historyImportTask for electron apps
        checkProtocolTask: null,
        checkStorageTask: null,
        historyImportTask: null,
      }
    }),
  ]
})
```

## Custom GA Tasks

In specific scenarios, you might need to disable or alter the [default Google Analytic Tasks](https://bit.ly/31Xetmg).

For example, you might want to cancel a request or enrich it. You can do this via [analytics plugins](https://getanalytics.io/plugins/writing-plugins/) or use the `tasks` config option on GA plugin for access to the `tracker` instance for GA only.

The tasks that can be hooked into are listed below & in the [GA task docs](https://bit.ly/31Xetmg)

- `customTask` By default, this task does nothing. Override it to provide custom behavior.
- `previewTask`	Aborts the request if the page is only being rendered to generate a 'Top Sites' thumbnail for Safari.
- `checkProtocolTask`	Aborts the request if the page protocol is not http or https.
- `validationTask` Aborts the request if required fields are missing or invalid.
- `checkStorageTask` Aborts the request if the tracker is configured to use cookies but the user's browser has cookies disabled.
- `historyImportTask` Imports info from ga.js/urchin.js cookies to preserve history when a site migrates to Universal Analytics.
- `samplerTask` Samples out visitors based on the sampleRate setting for this tracker.
- `buildHitTask` Builds a measurement protocol request string and stores it in the hitPayload field.
- `sendHitTask` Transmits the measurement protocol request stored in the hitPayload field to Google Analytics servers.
- `timingTask` Automatically generates a site speed timing hit based on the siteSpeedSampleRate setting for this tracker.
- `displayFeaturesTask` Sends an additional hit if display features is enabled & a previous hit has not been sent within the timeout period set by the advertising features cookie (_gat).

```js
import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'

/* initialize analytics and load plugins */
const analytics = Analytics({
  app: 'cool-app',
  plugins: [
    googleAnalytics({
      trackingId: '123-xyz',
      // Override or disable GA Tasks https://bit.ly/31Xetmg
      tasks: {
        // https://developers.google.com/analytics/devguides/collection/analyticsjs/tasks#adding_to_a_task
        sendHitTask: function (tracker) {
          // Save original Task
          var originalTask = tracker.get('sendHitTask')
          // Modifies sendHitTask to send a copy of the request to a local server after
          tracker.set('sendHitTask', function (model) {
            // 1. Send the normal request to www.google-analytics.com/collect.
            originalTask(model);
            // 2. Send to local server
            var xhr = new XMLHttpRequest();
            xhr.open('POST', '/localhits', true);
            xhr.send(model.get('hitPayload'));
          })
        },
        // https://developers.google.com/analytics/devguides/collection/analyticsjs/tasks#aborting_task_processing
        buildHitTask: (tracker) => {
          // Save original Task
          const originalBuildHitTask = tracker.get('buildHitTask')
          // Set custom buildHitTask with abort
          tracker.set('buildHitTask', function (model) {
            if (document.cookie.match(/testing=true/)) {
              throw new Error('Aborted tracking for test user.')
            }
            originalBuildHitTask(model);
          })
        },
      }
    }),
  ]
})
```

## Cookie Config

Some situations require changing the [cookie properties](https://developers.google.com/analytics/devguides/collection/analyticsjs/cookies-user-id#configuring_cookie_field_settings) of the Google Analytics cookie itself.

The GA Cookie fields that are available are:

| Field Name | Value Type | Default value | Description |
|:---------------------------|:-----------|:------------------|:---------------------|
| `cookieName`| text| _ga | Name of the cookie used to store analytics data |
| `cookieDomain`| text| The result of the following JavaScript expression: *document.location.hostname* | Specifies the domain used to store the analytics cookie. Setting this to 'none' sets the cookie without specifying a domain. |
| `cookieExpires`| integer| *63072000* (two years, in seconds) | Specifies the cookie expiration, in seconds. |
| `cookieUpdate`| boolean| true | When cookieUpdate is set to true (the default value), analytics.js will update cookies on each page load. This will update the cookie expiration to be set relative to the most recent visit to the site. |
| `cookieFlags`| text | | Specifies additional flags to append to the cookie. Flags must be separated by semicolons. |

You can add these properties in the `cookieConfig` on the plugin config.

```js
import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    googleAnalytics({
      trackingId: 'UA-1234567',
      cookieConfig: {
        cookieName: 'gaCookie',
        cookieDomain: 'blog.example.co.uk',
        cookieExpires: 60 * 60 * 24 * 28,  // Time in seconds.
        cookieUpdate: 'false',
        cookieFlags: 'SameSite=None; Secure',
      }
    })
  ]
})
```
