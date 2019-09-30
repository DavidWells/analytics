# Google analytics

> Note: This package has moved to [@analytics/google-analytics](https://www.npmjs.com/package/@analytics/google-analytics)

This library exports the `google-analytics` plugin for the [`analytics`](https://www.npmjs.com/package/analytics) package & standalone methods for any project to use to make it easier to interact with [Google Analytics](https://analytics.google.com/analytics/web/).

For more information [see the docs](https://getanalytics.io/plugins/google-analytics/).

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
  app: 'your-awesome-app',
  plugins: [
    // Google Analytics integration
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

After initializing `analytics` with your Google Analytics trackingId, data will be sent into google analytics whenever `analytics.page`, `analytics.track`, or `analytics.identify` are called.

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

> Note: We recommend using the `default` plugin export from this package alongside the `analytics` package.

The standalone methods below will send data to Google Analytics but are not attached to the [analytics plugin lifecycle](https://getanalytics.io/lifecycle/).

Use `analytics` + `@analytics/google-analytics` packages together as described above to enable these features:

- automatic library initialization
- offline retries
- middleware functionality
- callbacks
- listeners
- etc.

### Install

Using standalone

```bash
npm install @analytics/google-analytics
```

### Import and use standalone functions

When using `standalone` mode, you will need to initialize the provider javascript and pass in all the fields needed by said provider.

```js
// Stand alone functionality
import {
  initialize as loadGoogleAnalytics,
  page as pageView,
  track as trackEvent,
  identify as identifyVisitor
} from '@analytics/google-analytics'

// Load Google Analytics on page
loadGoogleAnalytics({ trackingId: 'UA-1234' })

// Track page view
pageView()

// Track custom event
trackEvent('buttonClick', {
  label: 'event label',
  category: 'event category',
  value: 'event value'
})

// Identify the visitor
identifyVisitor('user-123')
```

<!-- AUTO-GENERATED-CONTENT:START (PLUGIN_PLATFORMS_SUPPORTED) -->
## Platforms Supported

Browser and Node.js
<!-- AUTO-GENERATED-CONTENT:END (PLUGIN_PLATFORMS_SUPPORTED) -->

<!-- AUTO-GENERATED-CONTENT:START (PLUGIN_DOCS) -->
### Browser Methods

`page`, `track`, `identify`

### Node.js Methods
`page`, `track`, `identify`

<!-- AUTO-GENERATED-CONTENT:END (PLUGIN_DOCS) -->
