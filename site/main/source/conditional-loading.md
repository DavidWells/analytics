---
title: Conditional enabling & disabling of analytic providers
description: Enable or disable third party tracking scripts based on user feedback
pageTitle: Conditional loading
subTitle: Conditional enabling & disabling of analytic providers
---

With the analytics library it's possible to start your application & wait for user input before any third party analytics tools are loaded into the page.

This will ensure the users privacy settings respected & follow GDPR guidelines.

Hooray 🎉

## How does it work?

All [plugins](https://getanalytics.io/plugins/) support an `enabled` option. Additionally any [third party plugin](https://getanalytics.io/plugins/writing-plugins/) supports this option as well.

When the `enabled` flag is set to `false`, the plugin will noOp and not load any third party javascript in the users browser.

Setting `enabled: false` will cause the analytics plugin `initialize` function to be skipped and it will not perform any of its setup steps (like injected the tracking script on to the page).

## Disabling initial loading

The easiest way is setting `enabled` to false in the plugin config.

```js
import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    googleAnalytics({
      trackingId: 'ua-111-22222',
      // Disable GA from loading 
      enabled: false,
    }),
  ]
})

// Google Analytics will not load unless
// analytics.plugins.enable('google-analytics') is called
```

## Enabling & Disabling plugins

[analytics.plugins](https://getanalytics.io/api/#analyticsplugins) API methods allow for conditional enabling/disabling of integrations.

```js

// Enable google analytics based on user input...
analytics.plugins.enable('google-analytics')

// You can also disable plugins dynamically
analytics.plugins.disable(['plugin-1', 'plugin-3'])
```

## Using with Do Not Track

You can combine the `enabled` flag with the [Do not track utility](https://getanalytics.io/plugins/do-not-track/)

```js
import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'
import { doNotTrackEnabled } from 'analytics-plugin-do-not-track'

const dontTrack = doNotTrackEnabled()

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    googleAnalytics({
      trackingId: 'ua-111-22222',
      enabled: !dontTrack
    })
  ]
})
```

## Full Example

```js
import Analytics from 'analytics'
import googleAnalyticsPlugin from '@analytics/google-analytics'
import hubspotPlugin from '@analytics/hubspot'


const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    googleAnalyticsPlugin({
      trackingId: 'UA-xyz-123',
      // Disable GA from loading until `analytics.plugins.enable` called 
      enabled: false,
    }),
    hubSpotPlugin({
      portalId: '234576',
      // Disable HubSpot from loading `analytics.plugins.enable` called
      enabled: false,
    })
  ]
})

/* Because no analytic plugin is enabled, all calls will noOp & not load any third party JS */
analytics.page() // NoOp
analytics.track(...) // NoOp
analytics.identify(...) // NoOp

/**
 * Later in your app after getting user permission to load analytics tools...
 */

/* User opted in, enable analytics plugins */
analytics.plugins.enable(['google-analytics', 'hubspot']).then(() => {
  /* Plugins are now loaded into the page */

  /* Track a page view */
  analytics.page()

  /* Track a custom event */
  analytics.track('cartCheckout', {
    item: 'pink socks',
    price: 20
  })

  /* Identify a visitor */
  analytics.identify('userId123', {
    name: 'bob',
    email: 'bob@bob.com'
  })
})
```

[Ref issue](https://github.com/DavidWells/analytics/issues/128)

## By environment

By using conditional spreads in the `plugins` option you can load plugins based on the type of environment you are running in.

Here is an example of running different plugins in `development` and `production` environments.

```js
import Analytics from 'analytics'
import googleAnalyticsPlugin from '@analytics/google-analytics'
import originalSrcPlugin from 'analytics-plugin-original-source'

// What type of env are we in?
const IS_DEV_ENV = process.env.NODE_ENV === 'development'
const IS_PROD_ENV = process.env.NODE_ENV === 'production'

// dev only plugins
const devOnlyPlugins = [
  {
    name: 'logger',
    page: ({ payload }) => {
      console.log('page', payload)
    },
    track: ({ payload }) => {
      console.log('track', payload)
    },
    identify: ({ payload }) => {
      console.log('identify', payload)
    }
  },
]

// prod only plugins
const prodOnlyPlugins = [
  googleAnalyticsPlugin({
    trackingId: GOOGLE_ANALYTICS
  }),
]

// both prod & dev plugins
const loadInAllEnvPlugins = [
  originalSrcPlugin(),
]

const plugins = [
  ...loadInAllEnvPlugins,
  ...(IS_DEV_ENV) ? devOnlyPlugins : [],
  ...(IS_PROD_ENV) ? prodOnlyPlugins : [],
]

if (IS_DEV_ENV) {
  console.log('Analytics plugins', plugins)
}

// Initialize analytics
const analytics = Analytics({
  app: 'my-app-name',
  plugins: plugins
})

// Use it 
analytics.page()
```