---
title: Reset visitor information with analytics.reset()
description: Clear analytic cookies & localStorage values with analytics.reset()
pageTitle: Using analytics.reset()
subTitle: Reset user identifiers, stored traits, & third party analytic cookies
---

Analytics comes with a `reset` mechanism to reset information about the visitor.

This reset functionality will clear out the saved `userId`, `anonymousId`, user traits, and any third party cookies or local storage values set by a given analytics tool.

Think of it as the "big red RESET" button.

## When to use reset

Typically reset is used when a user logs in to a different account than the values previously persisted with `analytics.identify` calls on the browser or device.

Using `analytics.reset()` will wipe out previously stored values, start analytics with a clean slate and will set a new anonymous user Id.

## How to use reset

Inside of your app code, call reset.

```js
import Analytics from 'analytics'
import googleAnalyticsPlugin from '@analytics/google-analytics'

/* Initialize analytics */
const analytics = Analytics({
  app: 'my-app-name',
  version: 100,
  plugins: [
    googleAnalyticsPlugin({
      trackingId: 'UA-121991291',
    })
  ]
})

/*  
 Your app does stuff...
 User logs in to a different account...
*/

// Call analytics.reset to reset user Id & traits
analytics.reset()
```

It's also possible to fire a callback after reset is complete.

```js
analytics.reset(() => {
  console.log('reset complete')
  // Set new id/traits
})
```

## Reset in plugins

To leverage the core [analytics.reset](https://getanalytics.io/api/#analyticsreset) function, expose a reset function from your plugin.

```js
function analyticsPluginExamples(pluginConfig = {}) {
  return {
    name: 'my-analytics-plugin',
    /* Remove cookies & localStorage values when analytics.reset() is called */
    reset: ({ instance }) => {
      // Using native browser storage utilities
      window.localStorage.removeItem('thing')
      // Using analytic utilities
      instance.storage.removeItem('localStorageKey')
      instance.storage.removeItem('cookieName', { storage: 'cookie' })
      // ... etc
    },
    /* ... Other methods: page, track, identify */
  }
}
```

This function will trigger every time `analytics.reset()` is called from the application code.

Inside the reset function, you can clear out browser cookies, local storage, make remote clean up calls, etc. Whatever you need to do to set a clean "this is a new user" state.

See the [segment plugin](https://github.com/DavidWells/analytics/blob/85c7feecfd9f7b50eb88216029fc69e1ca0e3f21/packages/analytics-plugin-segment/src/browser.js#L70-L75) for a real world example.
