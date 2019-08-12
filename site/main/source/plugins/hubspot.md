---
title: HubSpot
description: Using the HubSpot plugin
---

Analytics integration with the [HubSpot](https://www.hubspot.com/) inbound marketing suite.

This plugin will send page views, track custom events, and identify visitors in your HubSpot account.

## Installation

```bash
npm install analytics
npm install analytics-plugin-ga
```

## How to use

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


## Configuration

**Arguments**

- **pluginConfig** <code>object</code> - Plugin settings
- **pluginConfig.portalId** <code>string</code> - The Hubspot Portal (or Hub) Id of your hubspot account

**Example**

```js
hubSpotPlugin({
  portalId: '234576'
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
