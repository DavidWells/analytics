---
title: Google Analytics
description: Using the google analytics plugin
---

Integration with google analytics for [analytics](https://www.npmjs.com/package/analytics)

## Install

```bash
npm install analytics
npm install analytics-plugin-ga
```

## Usage

Import analytics and use the google analytics plugin.

Set the `trackingId` of your site.

```js
import Analytics from 'analytics'
import googleAnalytics from 'analytics-plugin-ga'

const analytics = Analytics({
  app: 'doggieDating',
  version: 100,
  plugins: [
    // GA integration
    googleAnalytics({
      trackingId: 'UA-121991291'
    }),
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
analytics.identify('user-id-xyz')
```

## Sending additional event fields

To send tracking custom events to Google Analytics with `eventLabel`, `eventCategory`, and `eventValue` [fields](https://developers.google.com/analytics/devguides/collection/analyticsjs/events#event_fields), add the `label`, `category`, and `value` keys to the event properties.

```js
analytics.track('play', {
  category: 'Videos',
  label: 'Fall Campaign',
  value: 42
})
```
