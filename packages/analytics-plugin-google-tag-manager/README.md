# Google Tag Manager plugin for `analytics`

Integration with google tag manager for [analytics](https://www.npmjs.com/package/analytics)

For more information [see the docs](https://getanalytics.io/plugins/google-tag-manager/).

<!-- ANALYTICS_DOCS:START (TOC) -->
- [Usage](#usage)
- [Configure Google Tag Manager](#configure-google-tag-manager)
- [Plugin Options](#plugin-options)
<!-- ANALYTICS_DOCS:END (TOC) -->

<!-- ANALYTICS_DOCS:START (USAGE) -->
## Usage

Install `analytics` and `@analytics/google-tag-manager` packages

```bash
npm install analytics @analytics/google-tag-manager
```

Import and initialize in project

```js
import Analytics from 'analytics'
import googleTagManager from '@analytics/google-tag-manager'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    googleTagManager({
      containerId: 'GTM-123xyz',
    })
    // ... other plugins
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

## Configure Google Tag Manager

Make sure you have your google tags manager setup to fire on Page views.

If you are using a SPA you want to listen to history changes as well.

![image](https://user-images.githubusercontent.com/532272/52185417-538fe500-27d4-11e9-9500-abf702e5d802.png)

<!-- ANALYTICS_DOCS:START (API) -->
## Plugin Options

**Arguments**

- **pluginConfig** <code>object</code> - Plugin settings
- **pluginConfig.containerId** <code>string</code> - The Container ID uniquely identifies the GTM Container.

**Example**

```js
googleTagManager({
  containerId: 'GTM-123xyz'
})
```
<!-- ANALYTICS_DOCS:END -->

See the [full list of analytics provider plugins](https://getanalytics.io/plugins/) in the main repo.
