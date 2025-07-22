---
title: Disabling ID Storage
description: How to disable anonymous ID and user ID storage for privacy compliance
pageTitle: Disabling ID Storage
subTitle: Configure analytics to not persist any user identifiers
---

By default, the analytics library persists anonymous IDs and user IDs to browser storage to maintain user identity across sessions. However, for privacy-sensitive applications or GDPR compliance, you may want to disable all ID storage.

## Using Analytics Core

The simplest way to disable ID storage is to use `@analytics/core` instead of the main `analytics` package. The core library does not include any storage utilities by default.

### Installation

```bash
npm install @analytics/core
```

### Basic Setup Without Storage

```js
import { Analytics, EVENTS, CONSTANTS } from '@analytics/core'

// Initialize analytics without storage
const analytics = Analytics({
  app: 'my-app-name',
  plugins: [
    // Your analytics plugins here
  ]
  // Note: No storage configuration provided
})

export default analytics
```

With this setup:
- No anonymous IDs are persisted between sessions
- No user IDs are stored in browser storage
- Each page load generates a new anonymous ID
- User identification only lasts for the current session

### Comparison: With vs Without Storage

**Standard analytics package (with storage):**

```js
import Analytics from 'analytics'
import storage from '@analytics/storage-utils'

// This WILL persist IDs
const analytics = Analytics({
  app: 'my-app-name',
  storage: storage, // IDs stored in localStorage/cookies
  plugins: [
    // Your plugins
  ]
})
```

**Analytics core (without storage):**

```js
import { Analytics } from '@analytics/core'

// This will NOT persist IDs
const analytics = Analytics({
  app: 'my-app-name',
  // No storage configuration - no ID persistence
  plugins: [
    // Your plugins
  ]
})
```

## Understanding the Implications

When you disable ID storage:

### ✅ Benefits
- **Privacy compliant**: No user identifiers stored locally
- **GDPR friendly**: Reduces personal data processing
- **Smaller bundle**: Core package is lighter (~12.6kb vs ~13.2kb)
- **Clean sessions**: Each visit is treated as new

### ⚠️ Considerations
- **Session continuity**: Users cannot be tracked across browser sessions
- **Funnel analysis**: Multi-session funnels won't work as expected  
- **Return visitor tracking**: All visitors appear as new visitors
- **Cohort analysis**: User retention analysis becomes more difficult

## Custom Storage Configuration

If you need fine-grained control, you can use the main analytics package with custom storage settings:

```js
import Analytics from 'analytics'

const analytics = Analytics({
  app: 'my-app-name',
  // Disable specific storage mechanisms
  storage: {
    setItem: () => {}, // No-op function
    getItem: () => null, // Always return null
    removeItem: () => {} // No-op function
  },
  plugins: [
    // Your plugins
  ]
})
```

## Plugin Considerations

Some analytics plugins may have their own ID storage mechanisms. When disabling ID storage, verify that your plugins respect these settings:

```js
import { Analytics } from '@analytics/core'
import googleAnalytics from '@analytics/google-analytics'

const analytics = Analytics({
  app: 'my-app-name',
  plugins: [
    googleAnalytics({
      trackingId: 'UA-XXXXXX-X',
      // Some plugins have their own anonymize settings
      anonymizeIp: true,
      // Check plugin docs for privacy-related options
    })
  ]
})
```

## Testing Your Configuration

To verify that IDs are not being stored:

1. **Check browser storage**: Open Developer Tools → Application → Local Storage/Cookies
2. **Monitor network requests**: Look for stored IDs in analytics payloads
3. **Test across sessions**: Refresh the page and verify new anonymous IDs are generated

```js
// Debug: Log the anonymous ID to verify it changes each session
console.log('Current anonymous ID:', analytics.user().anonymousId)
```

## When to Use This Approach

Consider disabling ID storage when:

- Building privacy-first applications
- Complying with strict data regulations (GDPR, CCPA)
- Targeting privacy-conscious users
- Implementing analytics for public/shared devices
- Reducing data collection to essential metrics only

For most applications, the default storage behavior provides better user experience and more valuable analytics insights. Only disable storage when privacy requirements specifically mandate it.