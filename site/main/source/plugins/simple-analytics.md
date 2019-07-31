---
title: Simple Analytics
description: Using the Simple Analytics plugin
---

Integration with simple analytics [Simple Analytics](https://simpleanalytics.com/)

## Install

```bash
npm install analytics
npm install analytics-plugin-simple-analytics
```

## Usage

Initialize analytics with the simple analytics plugin.

Once initialized, simple analytics will automatically track page views.

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


See the [full list of analytics provider plugins](https://github.com/DavidWells/analytics#current-plugins) in the main repo.
