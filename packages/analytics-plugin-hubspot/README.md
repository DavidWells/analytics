# HubSpot plugin for `analytics`

Integration with HubSpot for [analytics](https://www.npmjs.com/package/analytics)

<!-- ANALYTICS_DOCS:START (TOC) -->
- [Usage](#usage)
- [Configuration](#configuration)
- [Plugin Options](#plugin-options)
<!-- ANALYTICS_DOCS:END (TOC) -->

## Usage

Install `analytics` and `analytics-plugin-hubspot` packages

```bash
npm install analytics analytics-plugin-hubspot
```

Import and initialize in project

```js
import Analytics from 'analytics'
import hubSpotPlugin from 'analytics-plugin-hubspot'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    hubSpotPlugin({
      portalId: '234576'
    })
  ]
})

/* Track page views */
analytics.page()

/* Track custom events */
analytics.track('buttonClicked')

/* Identify visitors */
analytics.identify('user-xzy-123', {
  email: 'bill@murray.com',
  accountLevel: 'pro'
})
```

## Using identify

**Important:** HubSpot requires an `email` field for making identify calls.

If your identify call does not contain `email` HubSpot will not be notified of the new user.

Also, when sending properties with `identify` calls, all `camelCase` traits are automatically converted to `snake_case`.

**Example:**

```js
analytics.identify('user-xzy-123', {
  email: 'bill@murray.com',
  accountLevel: 'pro' // trait will be `account_level`
})
```

## Configuration

<!-- ANALYTICS_DOCS:START (API) -->
## Plugin Options

**Arguments**

- **pluginConfig** <code>object</code> - Plugin settings
- **pluginConfig.portalId** <code>string</code> - The Hubspot Portal (or Hub) Id of your hubspot account

**Example**

```js
hubSpotPlugin({
  portalId: '234576'
})
```
<!-- ANALYTICS_DOCS:END -->
