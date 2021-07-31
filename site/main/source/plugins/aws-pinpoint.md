---
title: AWS Pinpoint
description: Using the AWS Pinpoint plugin
---

Integration with [AWS Pinpoint](https://aws.amazon.com/pinpoint/) for [analytics](https://www.npmjs.com/package/analytics)

Amazon Pinpoint is a flexible and scalable outbound and inbound marketing communications service. You can connect with customers over channels like email, SMS, push, or voice.

This package weighs in at <!-- AUTO-GENERATED-CONTENT:START (pkgSize:src=./dist/@analytics/aws-pinpoint.min.js) -->`14.23kb`<!-- AUTO-GENERATED-CONTENT:END --> gzipped.

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
- [Authenticating](#authenticating)

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
- **[analytics.track](https://getanalytics.io/api/#analyticstrack)** - Track custom events and send to AWSPinpoint
- **[analytics.identify](https://getanalytics.io/api/#analyticsidentify)** - Identify visitors and send details to AWSPinpoint
- **[analytics.reset](https://getanalytics.io/api/#analyticsreset)** - Reset browser storage cookies & localstorage for AWSPinpoint values

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
| `fips` <br/>_optional_ - string| Use the AWS FIPS service endpoint for Pinpoint |
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
            analyticsAWSPinpoint.default({
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

## Authenticating 

Pinpoint requires a valid identity to make calls to the service.

To do this you will need to use the AWS SDK, [AWS Amplify](https://docs.amplify.aws/lib/auth/getting-started/q/platform/js), [tiny-cognito](https://www.npmjs.com/package/tiny-cognito) etc to vend AWS creds for that visitors to be allowed to call pinpoint

The `getCredentials` must be provided and return an object that returns `accessKeyId`, `secretAccessKey`, `sessionToken` that have access to your AWS pinpoint instance.

```js
{
  accessKeyId: 'xyz',
  secretAccessKey: 'xyz',
  sessionToken: 'xyz'
}
```

Here is an example using `tiny-cognito`

```js
import Analytics from 'analytics'
import cognitoAuth from 'tiny-cognito'
import awsPinpointPlugin from '@analytics/aws-pinpoint'

// Identity pool ID that allows for unauthenticated access. 
const poolId = 'us-east-1:11111111-22222-222222-44444'
const region = 'us-east-1'

function getCredentials() {
  return cognitoAuth({
    COGNITO_REGION: region,
    IDENTITY_POOL_ID: poolId
  })
}

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    awsPinpointPlugin({
      pinpointAppId: '123456789',
      getCredentials: getCredentials
    })
  ]
})
```

Here is an example using `@aws-amplify/auth`

```js
import Analytics from 'analytics'
import AmplifyAuth from '@aws-amplify/auth'
import awsPinpointPlugin from '@analytics/aws-pinpoint'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    awsPinpointPlugin({
      pinpointAppId: '123456789',
      // Get credentials from amplify
      getCredentials: async () => {
        const creds = await AmplifyAuth.currentCredentials()
        return creds
      },
    })
  ]
})
```