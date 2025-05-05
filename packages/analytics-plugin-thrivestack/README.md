# ThriveStack Plugin for Analytics

Integration with [ThriveStack](https://thrivestack.ai) for the [`analytics`](https://www.npmjs.com/package/analytics) package.

## Installation

```bash
npm install analytics @analytics/thrivestack
```

## Usage

```js
import Analytics from 'analytics'
import thriveStackPlugin from '@analytics/thrivestack'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    thriveStackPlugin({
      apiKey: 'your-thrivestack-api-key',
      options: {
        // Additional configuration
        respectDoNotTrack: true,
        trackClicks: true,
        trackForms: true
      }
    })
  ]
})

// Track a page view
analytics.page()

// Track an event
analytics.track('itemPurchased', {
  price: 29.99,
  item: 'Premium Subscription'
})

// Identify a user
analytics.identify('user-123', {
  email: 'user@example.com',
  name: 'John Doe'
})

// Reset user and group data
analytics.reset()
```

## Configuration Options

The ThriveStack plugin accepts the following configuration options:

| Option | Description | Required | Default Value |
|:------|:------------|:---------|:--------------|
| `apiKey` | Your ThriveStack API key | Yes | - |
| `respectDoNotTrack` | Whether to respect DNT browser setting | No | `true` |
| `trackClicks` | Automatically track click events | No | `false` |
| `trackForms` | Automatically track form submissions | No | `false` |
| `enableConsent` | Enable consent management | No | `false` |
| `defaultConsent` | Default consent value | No | `false` |
| `source` | Source identifier | No | `''` |
| `batchSize` | Number of events to batch together | No | `10` |
| `batchInterval` | Interval in ms for processing event queue | No | `2000` |
| `options` | Additional options object | No | `{}` |

## Methods

### Core Methods

The ThriveStack plugin implements these core Analytics API methods:

- **page**: Tracks page views
- **track**: Tracks custom events
- **identify**: Identifies users and their traits
- **reset**: Resets user and group data

### Custom Methods

The ThriveStack plugin also exposes these additional methods:

```js
// Get the ThriveStack plugin instance
const thrivestack = analytics.plugins.thrivestack

// Group identification
thrivestack.groupIdentify(
  'group-123',  // Group ID
  {              // Group traits
    name: 'Engineering Team',
    group_type: 'department'
  },
  {              // Options
    userId: 'user-123'
  },
  (error, result) => {
    // Optional callback
    if (error) console.error(error)
    else console.log(result)
  }
)

// Set API configuration
thrivestack.setApiConfig({
  apiKey: 'new-api-key',
  source: 'new-source'
})

// Set user consent preferences
thrivestack.setConsent('analytics', true)
thrivestack.setConsent('marketing', false)

// Enable debug mode
thrivestack.enableDebugMode()

// Get device ID
const deviceId = thrivestack.getDeviceId()

// Get session ID
const sessionId = thrivestack.getSessionId()

// Get user ID
const userId = thrivestack.getUserId()

// Get group ID
const groupId = thrivestack.getGroupId()

// Get source
const source = thrivestack.getSource()

// Set source
thrivestack.setSource('mobile-app')

// Get UTM parameters
const utmParams = thrivestack.getUtmParameters()
```

## Automatic Event Tracking

When `trackClicks` and `trackForms` options are enabled, the ThriveStack plugin will automatically track:

1. Click events on page elements
2. Form submissions and abandoned forms

These events are sent with rich contextual data including:

- Element information (for clicks)
- Form completion percentage (for forms)
- Page information
- UTM parameters (when available)
- Device and session IDs

## Auto-Consent and Privacy

The ThriveStack plugin respects user privacy settings:

- When `respectDoNotTrack` is enabled, the plugin checks the browser's DNT setting
- Consent can be managed per category with the `setConsent` method
- Default consent behavior can be configured with the `defaultConsent` option

## Event Batching

Events are automatically batched according to the configured `batchSize` and `batchInterval` settings to optimize network requests.

## Browser Support

The ThriveStack plugin is compatible with all modern browsers:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- IE11 (with appropriate polyfills)

## License

MIT