# Segment plugin for `analytics`

Integration with [segment](https://segment.com/) for [analytics](https://www.npmjs.com/package/analytics)

For more information [see the docs](https://getanalytics.io/plugins/segment/).

<!-- ANALYTICS_DOCS:START (TOC) -->
- [Usage](#usage)
- [Plugin Options](#plugin-options)
<!-- ANALYTICS_DOCS:END (TOC) -->

<!-- ANALYTICS_DOCS:START (USAGE) -->
## Usage

Install `analytics` and `@analytics/segment` packages

```bash
npm install analytics @analytics/segment
```

Import and initialize in project

```js
import Analytics from 'analytics'
import segmentPlugin from '@analytics/segment'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    segmentPlugin({
      writeKey: '123-xyz'
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
- **pluginConfig.writeKey** <code>string</code> - Your segment writeKey
- **[pluginConfig.disableAnonymousTraffic]** (optional) <code>boolean</code> - Disable loading segment for anonymous visitors

**Example**

```js
segmentPlugin({
  writeKey: '123-xyz'
})
```
<!-- ANALYTICS_DOCS:END -->

See the [full list of analytics provider plugins](https://getanalytics.io/plugins/) in the main repo.
