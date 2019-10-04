# HubSpot plugin for `analytics`

Integration with HubSpot for [analytics](https://www.npmjs.com/package/analytics)

[View the docs](https://getanalytics.io/plugins/hubspot/)

<!-- ANALYTICS_DOCS:START (TOC) -->
- [Usage](#usage)
- [Using identify](#using-identify)
- [Configuration](#configuration)
- [Plugin Options](#plugin-options)
<!-- ANALYTICS_DOCS:END (TOC) -->

## Usage

Install `analytics` and `@analytics/hubspot` packages

```bash
npm install analytics
npm install @analytics/hubspot
```

Import and initialize in project

```js
import Analytics from 'analytics'
import hubSpotPlugin from '@analytics/hubspot'

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

When sending properties with `identify` calls, all `camelCase` traits are automatically converted to `snake_case`. There is one exception to this for `firstName` & `lastName` which are sent as `firstname` & `lastname`.

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
- **pluginConfig.portalId** <code>string</code> - The HubSpot Portal (or Hub) Id of your HubSpot account

**Example**

```js
hubSpotPlugin({
  portalId: '234576'
})
```
<!-- ANALYTICS_DOCS:END -->
