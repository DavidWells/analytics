---
title: How to extend existing analytic plugins
pageTitle: Extending existing plugins
description: How to extend & modify existing analytic plugins
---

The plugin system is built in such a way that plugin's themselves are extendable!

> Pluggable plugins? 🤯

If a plugin doesn't do exactly what you need and you require additional functionality with it you have 2 choices:

1. Submit an [issue or PR](https://github.com/DavidWells/analytics/issues) with the feature request
2. Add the functionality today in your code by extending the plugin!

Let's explore how we can extend plugins in this article.

## Overriding existing plugin functionality

At the end of the day, plugins are just plain old javascript objects.

This means we can alter them however we wish!

**Example:**

Lets say we want to have custom logic when it comes to executing tracking events with google analytics.

In this scenario, we only want to have page views sent to google analytics, and want all custom event tracking to send to another backend. We can do this by overriding the default `track` function that the Google Analytics plugin exposes.

```js
import Analytics from 'analytics'
import googleAnalyticsPlugin from '@analytics/google-analytics'

// Original google analytics plugin with no alterations
const originalGoogleAnalytics = googleAnalytics({
  trackingId: '1234'
})

function myCustomTrack({ payload }) {
  // Send data to custom backend
}

// Here are my custom overrides
const myPluginOverrides = {
  // Assign myCustomTrack over the original GA track call
  track: myCustomTrack,
}

const customGoogleAnalytics = Object.assign({}, originalGoogleAnalytics, myPluginOverrides)

const analytics = Analytics({
  app: 'my-app-name',
  plugins: [
    customGoogleAnalytics
  ]
})

// Event tracking with payload
analytics.track('itemPurchased', {
  price: 11,
  sku: '1234'
})

// myCustomTrack function will be called instead of the original track call from GA plugin
```

## Need help?

If you have questions about what plugins can do, or how to build one feel free to reach out to [@DavidWells](https://twitter.com/davidwells) on twitter.
