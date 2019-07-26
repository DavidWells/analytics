# Simple Analytics Plugin

Integration with simple analytics [Simple Analytics](https://simpleanalytics.com/)

## Usage

```js
import Analytics from 'analytics'
import simpleAnalyticsPlugin from 'analytics-plugin-simple-analytics'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    // Load simple analytics! 🎉
    simpleAnalyticsPlugin(),
  ]
})
```
