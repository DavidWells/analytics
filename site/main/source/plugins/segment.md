---
title: Segment
description: Using the segment plugin
---

Integration with [segment](https://segment.com/) for [analytics](https://www.npmjs.com/package/analytics)

<!-- ANALYTICS_DOCS:START (TOC) -->
- [Usage](#usage)
- [Plugin Options](#plugin-options)
<!-- ANALYTICS_DOCS:END (TOC) -->

<!-- ANALYTICS_DOCS:START (USAGE) -->
## Usage

Install `analytics` and `analytics-plugin-segment` packages

```bash
npm install analytics
npm install analytics-plugin-segment
```

Import and initialize in project

```js
import Analytics from 'analytics'
import segmentPlugin from 'analytics-plugin-segment'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    segmentPlugin({
      writeKey: '123-xyz'
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
- **pluginConfig.writeKey** <code>string</code> - Your segment writeKey
- **pluginConfig.disableAnonymousTraffic** <code>boolean</code> - Disable loading segment for anonymous visitors

**Example**

```js
segmentPlugin({
  writeKey: '123-xyz'
})
```
<!-- ANALYTICS_DOCS:END -->

See the [full list of analytics provider plugins](https://github.com/DavidWells/analytics#current-plugins) in the main repo.
