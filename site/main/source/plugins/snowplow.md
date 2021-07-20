---
title: Snowplow Analytics
description: Using the snowplow plugin
---

Integration with [Snowplow Analytics](https://www.snowplowanalytics.com/) for [analytics](https://www.npmjs.com/package/analytics) package.

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

</details>
<!-- AUTO-GENERATED-CONTENT:END -->

## Installation

Install `analytics` and `@analytics/snowplow` packages

```bash
npm install analytics
npm install @analytics/snowplow
```

<!-- AUTO-GENERATED-CONTENT:START (PLUGIN_DOCS) -->

## How to use

The `@analytics/snowplow` package works in [the browser](#browser-usage) and [server-side in Node.js](#server-side-usage). To use, install the package, include in your project and initialize the plugin with [analytics](https://www.npmjs.com/package/analytics).

Below is an example of how to use the browser plugin.

```js
import Analytics from 'analytics'
import snowplowPlugin from '@analytics/snowplow'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    // Minimal recommended configuration
    snowplowPlugin({
      name: 'snowplow',
      scriptSrc: '//*.cloudfront.net/2.17.0/sp.js',
      collectorUrl: 'collector.mysite.com',
      trackerSettings: {
        appId: 'myApp',
        contexts: {
          webPage: true
        }
      }
    })
  ]
})

/* Track a page view */
// Enable some automatic tracking before page event
analytics.on('initialize:snowplow', ({ instance }) => {
  instance.plugins.snowplow.enableActivityTracking(10, 10)
  instance.plugins.snowplow.enableLinkClickTracking()
})

// Track page
analytics.page()

// or Track page view with additional entities
analytics.page({
  contexts: [
    {
      schema: 'iglu:com.acme/blog_post/jsonschema/1-0-0',
      data: {
        title: 'Re-thinking the structure of event data',
        category: 'Data Insights',
        author: 'Cara Baestlein',
        datePublished: '2020-01-24'
      }
    }
  ]
})

/* Track a custom event */
// Track structured event
analytics.track('playedVideo', {
  category: 'Videos',
  label: 'Fall Campaign',
  value: 42
})

// or Track Self Describing event
analytics.track('selfDescribingEvent', {
  schema: 'iglu:com.acme/video_played/jsonschema/1-0-0',
  data: {
    id: 42,
    title: 'Fall Campaign'
  }
})

// or Track Self Describing event with additional entities
analytics.track('selfDescribingEvent', {
  schema: 'iglu:com.acme/video_played/jsonschema/1-0-0',
  data: {
    id: 42,
    title: 'Fall Campaign',
    videoTimestampInMs: 1104
  },
  contexts: [
    {
      schema: 'iglu:com.acme/product/jsonschema/1-0-0',
      data: {
        id: 'f9cb6cb6-5ca8-47a6-9035-d9c6ac13029e',
        category: 'clothing',
        subCategory: 'socks',
        price: 3.99
      }
    }
  ]
})

// or Track Enchanced Ecommerce event with product context
analytics.track('EnhancedEcommerceProductContext', {
  id: 'P12345',
  name: 'Android Warhol T-Shirt',
  list: 'Search Results',
  brand: 'Google',
  category: 'Apparel/T-Shirts',
  variant: 'Black',
  quantity: 1
})
analytics.track('EnhancedEcommerceAction', {
  action: 'add'
})

/* Identify a visitor */
analytics.identify('user-id-xyz')

```

After initializing `analytics` with the `snowplowPlugin` plugin, data will be sent into Snowplow Analytics whenever [analytics.page](https://getanalytics.io/api/#analyticspage), [analytics.track](https://getanalytics.io/api/#analyticstrack), or [analytics.identify](https://getanalytics.io/api/#analyticsidentify) are called.

See [additional implementation examples](#additional-examples) for more details on using in your project.

## Platforms Supported

The `@analytics/snowplow` package works in [the browser](#browser-usage) and [server-side in Node.js](#server-side-usage)

## Browser usage

The Snowplow Analytics client side browser plugin works with these analytic api methods:

- **[analytics.page](https://getanalytics.io/api/#analyticspage)** - Sends page views into Snowplow Analytics
- **[analytics.reset](https://getanalytics.io/api/#analyticsreset)** - Reset browser storage cookies & localstorage for Snowplow Analytics values
- **[analytics.track](https://getanalytics.io/api/#analyticstrack)** - Track custom events and send to Snowplow Analytics
- **[analytics.identify](https://getanalytics.io/api/#analyticsidentify)** - Identify visitors and send details to Snowplow Analytics

### Browser API

```js
import Analytics from 'analytics'
import snowplowPlugin from '@analytics/snowplow'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    // Minimal recommended configuration
    snowplowPlugin({
      name: 'snowplow',
      scriptSrc: '//*.cloudfront.net/2.17.0/sp.js',
      collectorUrl: 'collector.mysite.com',
      trackerSettings: {
        appId: 'myApp',
        contexts: {
          webPage: true
        }
      }
    })
  ]
})

```

### Configuration options for browser

| Option | description |
|:---------------------------|:-----------|
| `scriptSrc` <br/>**required** - string| Self-hosted Snowplow sp.js file location |
| `collectorUrl` <br/>**required** - string| The URL to a Snowplow collector |
| `name` <br/>_optional_ - string| The name to identify this instance of the tracker, use if using multiple tracker instances ('snowplow' default) |
| `trackerSettings` <br/>_optional_ - Object| The arg map to pass to the Snowplow Tracker |
| `trackerSettings.appId` <br/>_optional_ - string| The appId to identify this application |
| `trackerSettings.platform` <br/>_optional_ - string| Platform of tracking ("web" default) |
| `trackerSettings.cookieDomain` <br/>_optional_ - string| Domain to set cookie against |
| `trackerSettings.discoverRootDomain` <br/>_optional_ - string| Automatically discover root domain |
| `trackerSettings.cookieName` <br/>_optional_ - string| Prefix for cookies ("_sp_" default) |
| `trackerSettings.cookieSameSite` <br/>_optional_ - string| SameSite cookie setting ("None" default) |
| `trackerSettings.cookieSecure` <br/>_optional_ - boolean| Secure cookie setting (true default) |
| `trackerSettings.encodeBase64` <br/>_optional_ - boolean| Encode JSON objects as Base64 (true default) |
| `trackerSettings.respectDoNotTrack` <br/>_optional_ - bolean| Respect do not track (consider analytics-plugin-do-not-track) (false default) |
| `trackerSettings.pageUnloadTimer` <br/>_optional_ - number| Timeout in ms to block page navigation until buffer is empty (500 default) |
| `trackerSettings.forceSecureTracker` <br/>_optional_ - boolean| Forces requests to be sent https (false default) |
| `trackerSettings.eventMethod` <br/>_optional_ - string| Method to send events, GET, POST, Beacon (POST default) |
| `trackerSettings.bufferSize` <br/>_optional_ - number| Amount of events to buffer before sending (1 default) |
| `trackerSettings.maxPostBytes` <br/>_optional_ - number| Maximum size of POST or Beacon before sending (40000 default) |
| `trackerSettings.crossDomainLinker` <br/>_optional_ - string| function to configure which links to add cross domain linking |
| `trackerSettings.cookieLifetime` <br/>_optional_ - number| Cookie lifetime (63072000 default) |
| `trackerSettings.stateStorageStrategy` <br/>_optional_ - string| Use cookies and/or localstorage ("cookieAndLocalStorage" default) |
| `trackerSettings.maxLocalStorageQueueSize` <br/>_optional_ - number| Maximum numbers of events to buffer in localstorage to prevent filling local storage (1000 default) |
| `trackerSettings.resetActivityTrackingOnPageView` <br/>_optional_ - boolean| Flag to decide whether to reset page ping timers on virtual page view (true default) |
| `trackerSettings.connectionTimeout` <br/>_optional_ - boolean| The timeout, in milliseconds, before GET and POST requests will timeout (5000 default) (Snowplow JS 2.15.0+) |
| `trackerSettings.skippedBrowserFeatures` <br/>_optional_ - Array.<string>| Array to skip browser feature collection ([] default) (Snowplow JS 2.15.0+) |
| `trackerSettings.anonymousTracking` <br/>_optional_ - Object| Flag to enable anonymous tracking functionality (false default) |
| `trackerSettings.anonymousTracking.withSessionTracking` <br/>_optional_ - boolean| Flag to enable whether to continue tracking sessions in anonymous tracking mode (false default) |
| `trackerSettings.anonymousTracking.withServerAnonymisation` <br/>_optional_ - boolean| Flag which prevents collector from returning and capturing cookies and capturing ip address (false default) |
| `trackerSettings.contexts` <br/>_optional_ - Object| The auto contexts for each event |
| `trackerSettings.contexts.webPage` <br/>_optional_ - boolean| The webpage context, containing the page view id. (true default) |
| `trackerSettings.contexts.performanceTiming` <br/>_optional_ - boolean| Add performance timing information |
| `trackerSettings.contexts.clientHints` <br/>_optional_ - Object| Add Client Hint information (Snowplow JS 2.15.0+) |
| `trackerSettings.contexts.clientHints.includeHighEntropy` <br/>_optional_ - boolean| Capture High Entropy Client Hints (Snowplow JS 2.15.0+) |
| `trackerSettings.contexts.gaCookies` <br/>_optional_ - boolean| Add gaCookie information |
| `trackerSettings.contexts.geolocation` <br/>_optional_ - boolean| Add browser geolocation information |
| `trackerSettings.contexts.optimizelyXSummary` <br/>_optional_ - boolean| Add browser geolocation information |

## Server-side usage

The Snowplow Analytics server-side node.js plugin works with these analytic api methods:

- **[analytics.page](https://getanalytics.io/api/#analyticspage)** - Sends page views into Snowplow Analytics
- **[analytics.track](https://getanalytics.io/api/#analyticstrack)** - Track custom events and send to Snowplow Analytics
- **[analytics.identify](https://getanalytics.io/api/#analyticsidentify)** - Identify visitors and send details to Snowplow Analytics

### Server-side API

```js
import Analytics from 'analytics'
import snowplowPlugin from '@analytics/snowplow'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    snowplowPlugin({
      name: 'snowplow',
      collectorUrl: 'collector.mysite.com',
      appId: 'myApp'
    })
  ]
})

```

### Configuration options for server-side

| Option | description |
|:---------------------------|:-----------|
| `collectorUrl` <br/>**required** - string| The URL to a Snowplow collector |
| `appId` <br/>**required** - string| The appId to identify this application |
| `name` <br/>_optional_ - string| The name to identify this instance of the tracker ('snowplow' default) |
| `protocol` <br/>_optional_ - string| 'http' or 'https' ('https' default) |
| `port` <br/>_optional_ - string| collector port (80 or 443 default) |
| `method` <br/>_optional_ - string| The method to send events to collector, 'post' or 'get' ('post' default) |
| `bufferSize` <br/>_optional_ - string| Only send events once n are buffered. Defaults to 1 for GET requests and 10 for POST requests. |
| `retries` <br/>_optional_ - string| The number of times the tracker will try to resend an event. Defaults to 5. |
| `maxSockets` <br/>_optional_ - string| Node.js agentOptions object to tune performance (6 default) |
| `platform` <br/>_optional_ - string| Sets the platform https://bit.ly/302dSQy ('srv' default) |
| `screenResolution` <br/>_optional_ - object| Sets device screen resolution if available |
| `screenResolution.width` <br/>_optional_ - number| Positive Integer for screen width |
| `screenResolution.height` <br/>_optional_ - number| Positive Integer for screen height |
| `viewport` <br/>_optional_ - object| Sets device viewport if available |
| `viewport.width` <br/>_optional_ - number| Positive Integer for viewport width |
| `viewport.height` <br/>_optional_ - number| Positive Integer for viewprt height |
| `colorDepth` <br/>_optional_ - number| Positive Integer, in bits per pixel |
| `timezone` <br/>_optional_ - string| Set user’s timezone e.g. 'Europe/London' |
| `lang` <br/>_optional_ - string| Ser user's lang e.globalThis. 'en' |

## Additional examples

Below are additional implementation examples.

<details>
  <summary>Server-side ES6</summary>

  ```js
  import Analytics from 'analytics'
  import snowplowPlugin from '@analytics/snowplow'

  const analytics = Analytics({
    app: 'awesome-app',
    plugins: [
      snowplowPlugin({
        name: 'snowplow',
        collectorUrl: 'collector.mysite.com',
        appId: 'myApp'
      })
      // ...other plugins
    ]
  })

  /* Track a page view */
  // Track page
  analytics.page()

  // or Track page view with additional entities
  analytics.page({
    context: [
      {
        schema: 'iglu:com.acme/blog_post/jsonschema/1-0-0',
        data: {
          title: 'Re-thinking the structure of event data',
          url:
            'https://snowplowanalytics.com/blog/2020/01/24/re-thinking-the-structure-of-event-data/',
          category: 'Data Insights',
          author: 'Cara Baestlein',
          datePublished: '2020-01-24'
        }
      }
    ]
  })

  /* Track a custom event */
  // Track structured event
  analytics.track('playedVideo', {
    category: 'Videos',
    label: 'Fall Campaign',
    value: 42
  })

  // or Track Self Describing event
  analytics.track('selfDescribingEvent', {
    schema: 'iglu:com.acme/video_played/jsonschema/1-0-0',
    data: {
      id: 42,
      title: 'Fall Campaign'
    }
  })

  // or Track Self Describing event with additional entities
  analytics.track('selfDescribingEvent', {
    schema: 'iglu:com.acme/video_played/jsonschema/1-0-0',
    data: {
      id: 42,
      title: 'Fall Campaign',
      videoTimestampInMs: 1104
    },
    context: [
      {
        schema: 'iglu:com.acme/product/jsonschema/1-0-0',
        data: {
          id: 'f9cb6cb6-5ca8-47a6-9035-d9c6ac13029e',
          category: 'clothing',
          subCategory: 'socks',
          price: 3.99
        }
      }
    ]
  })

  // or Track Enchanced Ecommerce event with product context
  analytics.track('ScreenView', {
    name: 'Product Page',
    id: 'p-123',
    context: [
      {
        schema: 'iglu:com.acme/product/jsonschema/1-0-0',
        data: {
          id: 'f9cb6cb6-5ca8-47a6-9035-d9c6ac13029e',
          category: 'clothing',
          subCategory: 'socks',
          price: 3.99
        }
      }
    ]
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
  const snowplowPlugin = require('@analytics/snowplow').default

  const analytics = analyticsLib({
    app: 'my-app-name',
    plugins: [
      snowplowPlugin({
        name: 'snowplow',
        collectorUrl: 'collector.mysite.com',
        appId: 'myApp'
      })
    ]
  })

  /* Track a page view */
  // Track page
  analytics.page()

  // or Track page view with additional entities
  analytics.page({
    context: [
      {
        schema: 'iglu:com.acme/blog_post/jsonschema/1-0-0',
        data: {
          title: 'Re-thinking the structure of event data',
          url:
            'https://snowplowanalytics.com/blog/2020/01/24/re-thinking-the-structure-of-event-data/',
          category: 'Data Insights',
          author: 'Cara Baestlein',
          datePublished: '2020-01-24'
        }
      }
    ]
  })

  /* Track a custom event */
  // Track structured event
  analytics.track('playedVideo', {
    category: 'Videos',
    label: 'Fall Campaign',
    value: 42
  })

  // or Track Self Describing event
  analytics.track('selfDescribingEvent', {
    schema: 'iglu:com.acme/video_played/jsonschema/1-0-0',
    data: {
      id: 42,
      title: 'Fall Campaign'
    }
  })

  // or Track Self Describing event with additional entities
  analytics.track('selfDescribingEvent', {
    schema: 'iglu:com.acme/video_played/jsonschema/1-0-0',
    data: {
      id: 42,
      title: 'Fall Campaign',
      videoTimestampInMs: 1104
    },
    context: [
      {
        schema: 'iglu:com.acme/product/jsonschema/1-0-0',
        data: {
          id: 'f9cb6cb6-5ca8-47a6-9035-d9c6ac13029e',
          category: 'clothing',
          subCategory: 'socks',
          price: 3.99
        }
      }
    ]
  })

  // or Track Enchanced Ecommerce event with product context
  analytics.track('ScreenView', {
    name: 'Product Page',
    id: 'p-123',
    context: [
      {
        schema: 'iglu:com.acme/product/jsonschema/1-0-0',
        data: {
          id: 'f9cb6cb6-5ca8-47a6-9035-d9c6ac13029e',
          category: 'clothing',
          subCategory: 'socks',
          price: 3.99
        }
      }
    ]
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
      <title>Using @analytics/snowplow in HTML</title>
      <script src="https://unpkg.com/analytics/dist/analytics.min.js"></script>
      <script src="https://unpkg.com/@analytics/snowplow/dist/@analytics/snowplow.min.js"></script>
      <script type="text/javascript">
        /* Initialize analytics */
        var Analytics = _analytics.init({
          app: 'my-app-name',
          plugins: [
            // Minimal recommended configuration
            analyticsSnowplow({
              name: 'snowplow',
              scriptSrc: '//*.cloudfront.net/2.17.0/sp.js',
              collectorUrl: 'collector.mysite.com',
              trackerSettings: {
                appId: 'myApp',
                contexts: {
                  webPage: true
                }
              }
            })
          ]
        })

        /* Track a page view */
        // Enable some automatic tracking before page event
        analytics.on('initialize:snowplow', ({ instance }) => {
          instance.plugins.snowplow.enableActivityTracking(10, 10)
          instance.plugins.snowplow.enableLinkClickTracking()
        })

        // Track page
        analytics.page()

        // or Track page view with additional entities
        analytics.page({
          contexts: [
            {
              schema: 'iglu:com.acme/blog_post/jsonschema/1-0-0',
              data: {
                title: 'Re-thinking the structure of event data',
                category: 'Data Insights',
                author: 'Cara Baestlein',
                datePublished: '2020-01-24'
              }
            }
          ]
        })

        /* Track a custom event */
        // Track structured event
        analytics.track('playedVideo', {
          category: 'Videos',
          label: 'Fall Campaign',
          value: 42
        })

        // or Track Self Describing event
        analytics.track('selfDescribingEvent', {
          schema: 'iglu:com.acme/video_played/jsonschema/1-0-0',
          data: {
            id: 42,
            title: 'Fall Campaign'
          }
        })

        // or Track Self Describing event with additional entities
        analytics.track('selfDescribingEvent', {
          schema: 'iglu:com.acme/video_played/jsonschema/1-0-0',
          data: {
            id: 42,
            title: 'Fall Campaign',
            videoTimestampInMs: 1104
          },
          contexts: [
            {
              schema: 'iglu:com.acme/product/jsonschema/1-0-0',
              data: {
                id: 'f9cb6cb6-5ca8-47a6-9035-d9c6ac13029e',
                category: 'clothing',
                subCategory: 'socks',
                price: 3.99
              }
            }
          ]
        })

        // or Track Enchanced Ecommerce event with product context
        analytics.track('EnhancedEcommerceProductContext', {
          id: 'P12345',
          name: 'Android Warhol T-Shirt',
          list: 'Search Results',
          brand: 'Google',
          category: 'Apparel/T-Shirts',
          variant: 'Black',
          quantity: 1
        })
        analytics.track('EnhancedEcommerceAction', {
          action: 'add'
        })

        /* Identify a visitor */
        analytics.identify('user-id-xyz')
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

  Using `@analytics/snowplow` in ESM modules.

  ```html
  <!DOCTYPE html>
  <html>
    <head>
      <title>Using @analytics/snowplow in HTML via ESModules</title>
      <script>
        // Polyfill process.
        // **Note**: Because `import`s are hoisted, we need a separate, prior <script> block.
        window.process = window.process || { env: { NODE_ENV: 'production' } }
      </script>
      <script type="module">
        import analytics from 'https://unpkg.com/analytics/lib/analytics.browser.es.js?module'
        import analyticsSnowplow from 'https://unpkg.com/@analytics/snowplow/lib/analytics-plugin-snowplow.browser.es.js?module'
        /* Initialize analytics */
        const Analytics = analytics({
          app: 'analytics-html-demo',
          debug: true,
          plugins: [
            // Minimal recommended configuration
            analyticsSnowplow({
              name: 'snowplow',
              scriptSrc: '//*.cloudfront.net/2.17.0/sp.js',
              collectorUrl: 'collector.mysite.com',
              trackerSettings: {
                appId: 'myApp',
                contexts: {
                  webPage: true
                }
              }
            })
            // ... add any other third party analytics plugins
          ]
        })

        /* Track a page view */
        // Enable some automatic tracking before page event
        analytics.on('initialize:snowplow', ({ instance }) => {
          instance.plugins.snowplow.enableActivityTracking(10, 10)
          instance.plugins.snowplow.enableLinkClickTracking()
        })

        // Track page
        analytics.page()

        // or Track page view with additional entities
        analytics.page({
          contexts: [
            {
              schema: 'iglu:com.acme/blog_post/jsonschema/1-0-0',
              data: {
                title: 'Re-thinking the structure of event data',
                category: 'Data Insights',
                author: 'Cara Baestlein',
                datePublished: '2020-01-24'
              }
            }
          ]
        })

        /* Track a custom event */
        // Track structured event
        analytics.track('playedVideo', {
          category: 'Videos',
          label: 'Fall Campaign',
          value: 42
        })

        // or Track Self Describing event
        analytics.track('selfDescribingEvent', {
          schema: 'iglu:com.acme/video_played/jsonschema/1-0-0',
          data: {
            id: 42,
            title: 'Fall Campaign'
          }
        })

        // or Track Self Describing event with additional entities
        analytics.track('selfDescribingEvent', {
          schema: 'iglu:com.acme/video_played/jsonschema/1-0-0',
          data: {
            id: 42,
            title: 'Fall Campaign',
            videoTimestampInMs: 1104
          },
          contexts: [
            {
              schema: 'iglu:com.acme/product/jsonschema/1-0-0',
              data: {
                id: 'f9cb6cb6-5ca8-47a6-9035-d9c6ac13029e',
                category: 'clothing',
                subCategory: 'socks',
                price: 3.99
              }
            }
          ]
        })

        // or Track Enchanced Ecommerce event with product context
        analytics.track('EnhancedEcommerceProductContext', {
          id: 'P12345',
          name: 'Android Warhol T-Shirt',
          list: 'Search Results',
          brand: 'Google',
          category: 'Apparel/T-Shirts',
          variant: 'Black',
          quantity: 1
        })
        analytics.track('EnhancedEcommerceAction', {
          action: 'add'
        })

        /* Identify a visitor */
        analytics.identify('user-id-xyz')
      </script>
    </head>
    <body>
      ....
    </body>
  </html>

  ```

</details>

<!-- AUTO-GENERATED-CONTENT:END -->

See the [full list of analytics provider plugins](https://github.com/DavidWells/analytics#current-plugins) in the main repo.
