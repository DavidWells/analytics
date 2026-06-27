<!--
title: PostHog
description: Using the PostHog analytics plugin
-->

# PostHog plugin for `analytics`

Integration with [PostHog](https://posthog.com/) for [analytics](https://www.npmjs.com/package/analytics)

PostHog is an open-source product analytics platform. This plugin works in the browser and in Node.js.

[View the docs](https://getanalytics.io/plugins/posthog/)

<!-- AUTO-GENERATED-CONTENT:START (TOC:collapse=true&collapseText=Click to expand) -->
<details>
<summary>Click to expand</summary>

- [Installation](#installation)
- [How to use](#how-to-use)
- [Browser usage](#browser-usage)
- [Node.js usage](#nodejs-usage)
- [Plugin options](#plugin-options)
- [Custom methods](#custom-methods)

</details>
<!-- AUTO-GENERATED-CONTENT:END -->

## Installation

```bash
npm install analytics @analytics/posthog
```

## How to use

The `@analytics/posthog` package works in the [browser](#browser-usage) and in [Node.js](#nodejs-usage).

## Browser usage

```js
import Analytics from 'analytics'
import posthogPlugin from '@analytics/posthog'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    posthogPlugin({
      apiKey: 'phc_your_api_key',
      apiHost: 'https://us.i.posthog.com',
    })
  ]
})

// Track a page view
analytics.page()

// Track a custom event
analytics.track('buttonClicked', {
  label: 'Sign Up'
})

// Identify a user
analytics.identify('user-123', {
  name: 'Jane Doe',
  email: 'jane@example.com'
})
```

### Browser plugin options

| Option | Type | Default | Description |
|:--|:--|:--|:--|
| `apiKey` | `string` | **required** | Your PostHog project API key |
| `apiHost` | `string` | `https://us.i.posthog.com` | PostHog API host |
| `autocapture` | `boolean` | `true` | Enable autocapture of clicks, inputs, and page views |
| `capturePageview` | `boolean\|string` | `false` | Auto-capture `$pageview` events (see note below) |
| `capturePageleave` | `boolean` | `false` | Auto-capture `$pageleave` events |
| `customScriptSrc` | `string` | `null` | Override the PostHog JS library URL |
| `options` | `object` | `{}` | Additional [posthog.init options](https://posthog.com/docs/libraries/js#config) |

### Pageview tracking

PostHog normally defaults `capture_pageview` to `true`, which auto-captures a `$pageview` on initialization (and on history changes in SPAs). However, the `analytics` library has its own page tracking via `analytics.page()`, which this plugin maps to `posthog.capture('$pageview')`.

**To avoid duplicate pageview events**, this plugin defaults both `capturePageview` and `capturePageleave` to `false` and lets `analytics.page()` be the single source of truth for page lifecycle tracking.

| Scenario | `capturePageview` | How to track pages |
|:--|:--|:--|
| **Default (recommended)** | `false` | Call `analytics.page()` on route changes |
| **PostHog auto-tracking** | `true` or `'history_change'` | Do NOT call `analytics.page()` — PostHog handles it |

If you use a framework router (React Router, Next.js, etc.), the recommended approach is to keep the default (`false`) and call `analytics.page()` in your route change handler.

### Autocapture

PostHog's [autocapture](https://posthog.com/docs/product-analytics/autocapture) is enabled by default (`autocapture: true`). It automatically tracks clicks, form inputs, and other DOM interactions. This is independent of pageview tracking and works alongside the analytics library without conflicts. Set `autocapture: false` to disable it.

## Node.js usage

```js
import Analytics from 'analytics'
import posthogPlugin from '@analytics/posthog'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    posthogPlugin({
      apiKey: 'phc_your_api_key',
      apiHost: 'https://us.i.posthog.com',
    })
  ]
})

// Track an event (userId or anonymousId is required)
analytics.track('userSignedUp', {
  plan: 'pro'
})

// Identify a user
analytics.identify('user-123', {
  name: 'Jane Doe',
  email: 'jane@example.com'
})
```

### Node.js plugin options

| Option | Type | Default | Description |
|:--|:--|:--|:--|
| `apiKey` | `string` | **required** | Your PostHog project API key |
| `apiHost` | `string` | `https://us.i.posthog.com` | PostHog API host |
| `flushInterval` | `number` | `10000` | Flush interval in ms |
| `flushAt` | `number` | `20` | Flush at this number of events |
| `disableAnonymousTraffic` | `boolean` | `false` | Disable anonymous traffic |

## Custom methods

PostHog-specific methods are available via the analytics instance:

### Browser

```js
// Group analytics (e.g., associate user with a company)
analytics.plugins.posthog.group('company', 'company-id-123', {
  name: 'Acme Corp'
})

// Feature flags
analytics.plugins.posthog.isFeatureEnabled('new-dashboard')
analytics.plugins.posthog.getFeatureFlag('new-dashboard')
analytics.plugins.posthog.getFeatureFlagPayload('new-dashboard')
analytics.plugins.posthog.reloadFeatureFlags()

// Register super properties (sent with every event)
analytics.plugins.posthog.register({ environment: 'production' })

// Privacy controls
analytics.plugins.posthog.optOut()
analytics.plugins.posthog.optIn()

// Access the underlying posthog-js instance
const posthog = analytics.plugins.posthog.getClient()
```

### Node.js

```js
// Group analytics
analytics.plugins.posthog.group('company', 'company-id-123', {
  name: 'Acme Corp'
})

// Alias
analytics.plugins.posthog.alias('user-123', 'old-anonymous-id')

// Flush pending events
await analytics.plugins.posthog.flush()

// Shutdown client
await analytics.plugins.posthog.shutdown()

// Access the underlying posthog-node instance
const client = analytics.plugins.posthog.getClient()
```
