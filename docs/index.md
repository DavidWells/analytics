---
title: Analytics Documentation
description: Pluggable analytics library
---

# Analytics

This is a pluggable event driven analytics library designed to work with any third party analytics tool.

##  Why

Companies frequently change analytics & collection requirements. This results in adding & removing analytic services a painful time consuming process.

This library aims to solves that with a simple abstraction layer.

##  Philosophy

> You should never be locked into a tool.

To add or remove an analytics provider adjust the `plugins` you load into `analytics`.

## Install

```bash
npm install analytics
```

Or as a script tag:

```html
<script src="https://unpkg.com/analytics/dist/analytics.min.js"></script>
```

## Usage

```js
import Analytics from 'analytics'
import googleAnalyticsPlugin from 'analytics-plugin-ga'
import customerIOPlugin from 'analytics-plugin-customerio'

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
// Fire event tracking
analytics.track('userPurchase', {
  price: 20
})
// Identify a visitor
analytics.identify('user-id-xyz', {
  firstName: 'bill',
  lastName: 'murray',
  email: 'da-coolest@aol.com'
})
//...
```

<details>
  <summary>Node.js usage</summary>

  ```js
  const { analytics } = require('analytics')
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

</details>

<details>
  <summary>Browser usage</summary>

  ```html
  <script src="https://unpkg.com/analytics/dist/analytics.min.js"></script>
  <script>
    const Analytics = analytics({
      app: 'my-app-name',
      version: 100,
      ...plugins
    })

    Analytics.track()

    // optionally expose to window
    window.Analytics = Analytics
  </script>
  ```

</details>

## Demo

See [Analytics Demo](https://analytics-demo.netlify.com/) for a site example.
