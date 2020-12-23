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

```js
import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'

/* initialize analytics and load plugins */
const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    ...{
      ...googleAnalytics({
        trackingId: 'ua-111-22222',
      }),
      // Disable GA from loading 
      // until analytics.plugins.enable('google-analytics') called in app
      ...{ enabled: false }
    }
  ]
})
```

## Enabling & Disabling plugins

[analytics.plugins](https://getanalytics.io/api/#analyticsplugins) API methods allow for conditional enabling/disabling of integrations.

```js

// Enable google analytics based on user input...
analytics.plugins.enable('google-analytics')

// You can also disable plugins dynamically
analytics.plugins.disable(['plugin-1', 'plugin-3'])
```

## Full Example

```js
import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'

/* Plugin is inert until analytics boots up */
const GAPlugin = googleAnalytics({
  trackingId: 'ua-111-22222',
})

/* Because plugins are just javascript objects, we can enhance it with a new key */
const conditionallyLoadedGA = {
  ...customGA,
  enabled: false, // <== Set enabled to false to stop the plugin from automatically injected the script in
}

/* initialize analytics and load plugins */
const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    // Google analytics will only load if 
    // analytics.plugins.enable('google-analytics') is called
    conditionallyLoadedGA,
    {
      name: 'plugin-1',
      enabled: true, // <= default
      initialize: () => {
        // setup logic, load scripts etc
      },
      page: ({ payload }) => console.log('plugin-x page view', payload),
      // ... other methods
    },
    {
      name: 'plugin-2',
      enabled: false, // <= plugin is disabled. 
      initialize: () => {
        // This will fire when analytics.plugins.enable('plugin-2') is called
        console.log('initialization logic will only run once I am loaded')
      },
      page: ({ payload }) => {
        console.log('plugin-2 page view', payload)
      },
    },
    {
      name: 'plugin-3',
      page: ({ payload }) => {
        console.log('plugin-3 page view', payload)
      },
    },
  ]
})

/* Later in your app code... */

// Send page view to all enabled plugins
analytics.page()

// Enable google analytics based on user input...
analytics.plugins.enable('google-analytics').then(() => {
  // Send page view to all enabled plugins including Google analytics
  analytics.page()
})

// You can also disable plugins dynamically
analytics.plugins.disable(['plugin-1', 'plugin-3']).then(() => {
  // Send tracking event to all enabled plugins 
  analytics.track('buttonClicked', { price: 100 })
})
```

[Ref issue](https://github.com/DavidWells/analytics/issues/128)