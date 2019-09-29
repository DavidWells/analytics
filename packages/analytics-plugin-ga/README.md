# Google Analytics Plugin

[`analytics`](https://www.npmjs.com/package/analytics) integration for using Google Analytics.

[See the docs](https://getanalytics.io/plugins/google-analytics/)

## Install

```bash
npm install analytics
npm install @analytics/google-analytics
```

## Usage

Import analytics and use the google analytics plugin.

Set the `trackingId` of your site.

```js
import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'

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

## Standalone Usage

This package exports Google Analytics helper methods for any project to use.

We recommend using the `default` export from this package with the `analytics` package.

The analytics plugin will handle:

- library initialization
- offline retries
- middleware functionality
- callbacks
- etc.

The methods below are exposed do not attach to the `analytics` plugin lifecycle.

### Install

```bash
npm install @analytics/google-analytics
```

### Import and use standalone functions

```js
// Stand alone functionality
import { initialize, page, track, identify } from '@analytics/google-analytics'

// Load GA on page
initialize({
  trackingId: 'UA-1234'
})

// Track page view
page()

// Track custom event
track('buttonClick', {
  label: 'event label',
  category: 'event category',
  value: 'event value'
})
```

<!-- AUTO-GENERATED-CONTENT:START (PLUGIN_PLATFORMS_SUPPORTED) -->
## Platforms Supported

browser and node
<!-- AUTO-GENERATED-CONTENT:END (PLUGIN_PLATFORMS_SUPPORTED) -->

<!-- AUTO-GENERATED-CONTENT:START (PLUGIN_DOCS) -->
## Platform browser
`page`, `track`, `identify`

## Platform node
`page`, `track`, `identify`

<!-- AUTO-GENERATED-CONTENT:END (PLUGIN_DOCS) -->
