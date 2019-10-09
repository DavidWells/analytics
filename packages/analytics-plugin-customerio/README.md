# Customer.io plugin for analytics

Integration with [customer.io](https://customer.io/) for [analytics](https://www.npmjs.com/package/analytics) package.

[View the docs](https://getanalytics.io/plugins/customerio/)

<!-- ANALYTICS_DOCS:START (USAGE) -->
## Usage

Install `analytics` and `@analytics/customerio` packages

```bash
npm install analytics @analytics/customerio
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
    // ...other plugins
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
- **[pluginConfig.disableAnonymousTraffic]** (optional) <code>boolean</code> - Disable anonymous events from firing

**Example**

```js
customerIOPlugin({
  siteId: '123-xyz'
})
```
<!-- ANALYTICS_DOCS:END -->


See the [full list of analytics provider plugins](https://github.com/DavidWells/analytics#current-plugins) in the main repo.
