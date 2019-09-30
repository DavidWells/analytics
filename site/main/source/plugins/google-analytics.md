---
title: Adding Google Analytics to your app using open source analytics
description: Connect Google Analytics to the analytics library
pageTitle: Google Analytics
---

Connect and send tracking data to [Google Analytics](https://analytics.google.com/analytics/web/) with `analytics`.

<!-- AUTO-GENERATED-CONTENT:START (TOC:collapse=true&collapseText=Click to expand table of contents) -->
<details>
<summary>Click to expand table of contents</summary>

- [Using with analytics](#using-with-analytics)
  * [Installation](#installation)
  * [Using in your app](#using-in-your-app)
  * [Customizing event payloads](#customizing-event-payloads)
- [Using as a standalone package](#using-as-a-standalone-package)
  * [Installation](#installation-1)
  * [Using in your app](#using-in-your-app-1)
- [Platforms Supported](#platforms-supported)
  * [Browser Methods](#browser-methods)
  * [Node.js Methods](#nodejs-methods)

</details>
<!-- AUTO-GENERATED-CONTENT:END -->

## Using with analytics

To use as an `analytics` plugin, install the package and initialize in your site or application.

### Installation

```bash
npm install analytics
npm install @analytics/google-analytics
```

### Using in your app

Set the `trackingId` of your site. This Id can be found in your google analytics admin panel.

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

### Customizing event payloads

To send tracking custom events to Google Analytics with `eventLabel`, `eventCategory`, and `eventValue` [fields](https://developers.google.com/analytics/devguides/collection/analyticsjs/events#event_fields), add the `label`, `category`, and `value` keys to the event properties.

```js
analytics.track('play', {
  category: 'Videos',
  label: 'Fall Campaign',
  value: 42
})
```

## Using as a standalone package

This package exports Google Analytics helper methods for any project to use.

> **Note:** We recommend using the plugin described above _with_ the `analytics` library.

The standalone methods below will send data to Google Analytics but are not attached to the [analytics plugin lifecycle](https://getanalytics.io/lifecycle/). This means a number of things won't be available.

Use `analytics` + `@analytics/google-analytics` packages together as described above to enable these features:

- automatic library initialization
- offline retries
- middleware functionality
- callbacks
- listeners
- etc.

When using `standalone` methods, you will need to handle these edge cases & retries yourself.

### Installation

Install the `@analytics/google-analytics` package.

```bash
npm install @analytics/google-analytics
```

### Using in your app

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

**Tip**: The benefit of using with the `@analytics/google-analytics` as an `analytics` plugin is not having to update many places in your code when adding or removing an analytics tool. This make refactoring and responding to new business requirements much easier.

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
