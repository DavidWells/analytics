<!--
title: AWS Pinpoint
description: Using the AWS Pinpoint plugin
-->
# AWS Pinpoint Plugin for `analytics`

Integration with [AWS Pinpoint](https://aws.amazon.com/pinpoint/) for [analytics](https://www.npmjs.com/package/analytics)

AWS Pinpoint provides analytics, live chat, & automation tools to help developers identify areas of improvement in their application flows & to help convert users.

[View the docs](https://getanalytics.io/plugins/aws-pinpoint/).

<!-- AUTO-GENERATED-CONTENT:START (TOC:collapse=true&collapseText=Click to expand) -->
<details>
<summary>Click to expand</summary>

- [Installation](#installation)
- [How to use](#how-to-use)
- [Platforms Supported](#platforms-supported)
- [Browser usage](#browser-usage)
  * [Browser API](#browser-api)
  * [Configuration options for browser](#configuration-options-for-browser)
- [Additional examples](#additional-examples)
- [Finding your AWS Pinpoint projectToken](#finding-your-aws-pinpoint-projecttoken)
- [Running on localHost](#running-on-localhost)

</details>
<!-- AUTO-GENERATED-CONTENT:END -->

## Installation

Install `analytics` and `@analytics/aws-pinpoint` packages

```bash
npm install analytics
npm install @analytics/aws-pinpoint
```

<!-- AUTO-GENERATED-CONTENT:START (PLUGIN_DOCS) -->

## How to use

The `@analytics/aws-pinpoint` package works in [the browser](#browser-usage). To use, install the package, include in your project and initialize the plugin with [analytics](https://www.npmjs.com/package/analytics).

Below is an example of how to use the browser plugin.

```js
import Analytics from 'analytics'
import awsPinpointPlugin from '@analytics/aws-pinpoint'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    awsPinpointPlugin({
      pinpointAppId: '938bebb1ae954e123133213160f2b3be4',
      getCredentials: () => Auth.currentCredentials()
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

After initializing `analytics` with the `awsPinpointPlugin` plugin, data will be sent into AWSPinpoint whenever [analytics.page](https://getanalytics.io/api/#analyticspage), [analytics.track](https://getanalytics.io/api/#analyticstrack), or [analytics.identify](https://getanalytics.io/api/#analyticsidentify) are called.

See [additional implementation examples](#additional-examples) for more details on using in your project.

## Platforms Supported

The `@analytics/aws-pinpoint` package works in [the browser](#browser-usage)

## Browser usage

The AWSPinpoint client side browser plugin works with these analytic api methods:

- **[analytics.page](https://getanalytics.io/api/#analyticspage)** - Sends page views into AWSPinpoint
- **[analytics.reset](https://getanalytics.io/api/#analyticsreset)** - Reset browser storage cookies & localstorage for AWSPinpoint values
- **[analytics.track](https://getanalytics.io/api/#analyticstrack)** - Track custom events and send to AWSPinpoint
- **[analytics.identify](https://getanalytics.io/api/#analyticsidentify)** - Identify visitors and send details to AWSPinpoint

### Browser API

```js
import Analytics from 'analytics'
import awsPinpointPlugin from '@analytics/aws-pinpoint'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    awsPinpointPlugin({
      pinpointAppId: '938bebb1ae954e123133213160f2b3be4',
      getCredentials: () => Auth.currentCredentials()
    })
  ]
})

```

### Configuration options for browser

| Option | description |
|:---------------------------|:-----------|
| `pinpointAppId` <br/>**required** - string| AWS Pinpoint app Id for client side tracking |
| `getCredentials` <br/>**required** - function| Async function to get AWS Cognito creds |
| `pinpointRegion` <br/>_optional_ - string| AWS Pinpoint region. Defaults to us-east-1 |
| `appTitle` <br/>_optional_ - string| The title of the app that's recording the event. |
| `appPackageName` <br/>_optional_ - string| The name of the app package, such as com.example.my_app. |
| `appVersionCode` <br/>_optional_ - string| The version number of the app, such as 3.2.0 |
| `disableAnonymousTraffic` <br/>_optional_ - boolean| Disable anonymous events from firing |


## Additional examples

Below are additional implementation examples.

<details>
  <summary>Using in HTML</summary>

  Below is an example of importing via the unpkg CDN. Please note this will pull in the latest version of the package.

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/aws-pinpoint in HTML</title>
      <script src="https://unpkg.com/analytics/dist/analytics.min.js"></script>
      <script src="https://unpkg.com/@analytics/aws-pinpoint/dist/@analytics/aws-pinpoint.min.js"></script>
      <script type="text/javascript">
        /* Initialize analytics */
        var Analytics = _analytics.init({
          app: 'my-app-name',
          plugins: [
            analyticsAWSPinpoint({
              pinpointAppId: '938bebb1ae954e123133213160f2b3be4',
              getCredentials: () => Auth.currentCredentials()
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

  Using `@analytics/aws-pinpoint` in ESM modules.

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/aws-pinpoint in HTML via ESModules</title>
      <script>
        // Polyfill process.
        // **Note**: Because `import`s are hoisted, we need a separate, prior <script> block.
        window.process = window.process || { env: { NODE_ENV: 'production' } }
      </script>
      <script type="module">
        import analytics from 'https://unpkg.com/analytics/lib/analytics.browser.es.js?module'
        import analyticsAWSPinpoint from 'https://unpkg.com/@analytics/aws-pinpoint/lib/analytics-plugin-aws-pinpoint.browser.es.js?module'
        /* Initialize analytics */
        const Analytics = analytics({
          app: 'analytics-html-demo',
          debug: true,
          plugins: [
            analyticsAWSPinpoint({
              pinpointAppId: '938bebb1ae954e123133213160f2b3be4',
              getCredentials: () => Auth.currentCredentials()
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

## Finding your AWS Pinpoint projectToken

Inside of the AWS Pinpoint admin panel you can find your tracking ID in the URL of the dashboard.

![image](https://user-images.githubusercontent.com/532272/70370383-9a7abb00-187b-11ea-8fc7-97584d5ba8c2.png)

It's also visible in the tracking code

![image](https://user-images.githubusercontent.com/532272/70370401-b7af8980-187b-11ea-9f2b-dfac31b427af.png)

Take the `projectToken` value and use it in the initialization of the plugin

## Running on localHost

By default this plugin does not send data when running locally. This helps prevent local development from polluting your stats.

To turn on localhost tracking, set the `trackLocal` configuration setting to true.

```js
const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    awsPinpointPlugin({
      projectToken: 'GSN-123456-A',
      trackLocal: true
    })
  ]
})
```
