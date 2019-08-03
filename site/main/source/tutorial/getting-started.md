---
title: Getting started
description: Start here to learn how to build apps with analytics
---

This guide will walk you though installing and hooking up analytics in your application.

Analytics is designed to work with any frontend framework or with static HTML.

## 1. Installation

**Install the analytics module from [npm](https://www.npmjs.com/package/analytics)**

```bash
npm install analytics --save
```

## 2. Include in project

Import `analytics` and initialize the library with the analytics plugins of your choice.

```js{2}
/* src/analytics.js */
import Analytics from 'analytics'

const analytics = Analytics({
  app: 'app-name',
  plugins: [
    // ... your analytics integrations
  ]
})

export default analytics
```

## 3. Connect plugins

**Connect analytics with a third party analytics tool**

Install a plugin or [create a plugin](http://getanalytics.io/plugins/writing-plugins) to connect to your third party analytics tool (example Google analytics or HubSpot).

The example below is showing how to connect google analytics.

The plugin will load google analytics tracking script on the page & handle page tracking.

```js{7-11}
/* src/analytics.js */
import Analytics from 'analytics'
import googleAnalytics from 'analytics-plugin-ga'

const analytics = Analytics({
  app: 'app-name',
  plugins: [
    googleAnalytics({
      trackingId: 'UA-121991123',
    })
  ]
})

export default analytics
```

## 4. Use in your app

Use the analytics instance in your code base.

```js
// your instance loaded with plugins
import analytics from './analytics'

/* Track page views */
analytics.page()

/* Identify users */
analytics.identify('userid-123', {
  favoriteColor: 'blue',
  membershipLevel: 'pro'
})

/* Track events */
analytics.track('buttonClicked', {
  value: 100
})
```

## Usage in React

Checkout the [using analytics with react demo](https://analytics-react-example.netlify.com/) & the [source code](https://github.com/DavidWells/analytics/tree/master/examples/react)

For a larger example see the [kitchen sink example](https://analytics-demo.netlify.com) & it's [source code](https://github.com/DavidWells/analytics/tree/master/examples/demo).

## Usage in HTML

Analytics works in vanilla HTML pages and can be [imported from a CDN](#cdn-browser-usage).

[Live demo](https://analytics-html-example.netlify.com/) & the [source code](https://github.com/DavidWells/analytics/tree/master/examples/vanilla-html).

## Usage in Preact

Preact is a fast 3kB alternative to React with the same modern API.

[Using analytics with preact demo](https://analytics-preact-example.netlify.com/) & the [source code](https://github.com/DavidWells/analytics/tree/master/examples/preact).

## Usage in Vue

[Using analytics with vue demo](https://analytics-vue-example.netlify.com/) & the [source code](
https://github.com/DavidWells/analytics/tree/master/examples/vue).

## Usage in Angular

Demo coming soon. The above steps will work for Vue apps.

([contributions to the docs welcome](https://github.com/DavidWells/analytics/tree/master/examples) 😃).

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
