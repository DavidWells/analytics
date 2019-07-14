---
title: Installation
description: How to install analytics
---

Analytics is designed to work with any frontend framework or with static HTML.

```bash
npm install analytics --save
```

Or as a script tag:

```html
<script src="https://unpkg.com/analytics/dist/analytics.min.js"></script>
```

## ES6 Usage

```js
import Analytics from 'analytics'
import googleAnalyticsPlugin from 'analytics-plugin-ga'
import customerIOPlugin from 'analytics-plugin-customerio'

/* Initialize analytics */
const analytics = Analytics({
  app: 'my-app-name',
  version: 100,
  plugins: [
    googleAnalyticsPlugin({
      trackingId: 'UA-121991291',
    }),
    customerIOPlugin({
      siteId: '123-xyz'
    })
  ]
})

/* Track a page view */
analytics.page()

/* Track a custom event */
analytics.track('userPurchase', {
  price: 20
  item: 'pink socks'
})

/* Identify a visitor */
analytics.identify('user-id-xyz', {
  firstName: 'bill',
  lastName: 'murray',
  email: 'da-coolest@aol.com'
})
```


## CDN Browser usage

When importing global `analytics` into your project from a cdn the library is expose via a global `_analytics` variable.

Call `_analytics.init` to create an analytics instance.

```html
<script src="https://unpkg.com/analytics/dist/analytics.min.js"></script>
<script>
  const Analytics = _analytics.init({
    app: 'my-app-name',
    version: 100,
    ...plugins
  })

  Analytics.track()

  // optionally expose to window
  window.Analytics = Analytics
</script>
```


## Node.js Usage


For ES6/7 javascript you can `import Analytics from 'analytics'` for normal node.js usage you can import like so:

```js
const { Analytics } = require('analytics')
// or const Analytics = require('analytics').default

const analytics = Analytics({
  app: 'my-app-name',
  version: 100,
  plugins: [
    googleAnalyticsPlugin({
      trackingId: 'UA-121991291',
    }),
    customerIOPlugin({
      siteId: '123-xyz'
    })
  ]
})

// Fire a page view
analytics.page()
```
