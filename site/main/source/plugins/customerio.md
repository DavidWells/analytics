---
title: Customer.io
description: Using the customer.io plugin
---

Integration with [customer.io](https://customer.io/) for [analytics](https://www.npmjs.com/package/analytics) package.

<!-- ANALYTICS_DOCS:START (TOC) -->
- [Usage](#usage)
- [Plugin Options](#plugin-options)
<!-- ANALYTICS_DOCS:END (TOC) -->

<!-- ANALYTICS_DOCS:START (USAGE) -->
## Usage

Install `analytics` and `@analytics/customerio` packages

```bash
npm install analytics
npm install @analytics/customerio
```

Import and initialize in project

```js
import Analytics from 'analytics'
import customerIOPlugin from '@analytics/customerio'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    customerIOPlugin({
      siteId: '123-xyz'
    })
  ]
})

/* Track page views */
analytics.page()

/* Track custom events */
analytics.track('buttonClicked')

/* Identify visitors */
analytics.identify('user-xzy-123', {
  name: 'Bill Murray',
  cool: true
})

```
<!-- ANALYTICS_DOCS:END -->

<!-- ANALYTICS_DOCS:START (API) -->
## Plugin Options

**Arguments**

- **pluginConfig** <code>object</code> - Plugin settings
- **pluginConfig.siteId** <code>string</code> - Customer.io site Id for client side tracking

**Example**

```js
customerIOPlugin({
  siteId: '123-xyz'
})
```
<!-- ANALYTICS_DOCS:END -->


See the [full list of analytics provider plugins](https://github.com/DavidWells/analytics#current-plugins) in the main repo.
