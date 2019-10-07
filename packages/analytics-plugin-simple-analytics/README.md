# Simple Analytics Plugin

> Note: This package has moved to [@analytics/simple-analytics](https://www.npmjs.com/package/@analytics/simple-analytics)

Integration with simple analytics [Simple Analytics](https://simpleanalytics.com/)

For more information [see the docs](https://getanalytics.io/plugins/simple-analytics/).

## Install

Include `analytics` and `@analytics/simple-analytics` in the source code of your project.

```bash
npm install analytics
npm install @analytics/simple-analytics
```

## Usage

Initialize `analytics` with the simple-analytics plugin. After initialization the simple-analytics script will be automatically loaded into the page and send page views to [Simple Analytics](https://simpleanalytics.com/).

```js
import Analytics from 'analytics'
import simpleAnalyticsPlugin from '@analytics/simple-analytics'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    simpleAnalyticsPlugin(),
    // ... other plugins
  ]
})
```

The simple analytics plugin automatically tracks page views on route changes for single page applications.
