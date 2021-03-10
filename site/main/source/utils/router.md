---
title: SPA Router Utilities
pageTitle: Router Utils
description: Utility library for single page app routing
---

Utilities for listening to route changes in SPA.

## Basic Usage

```js
import onRouteChange from '@analytics/router-utils'
import analytics from './analytics'

onRouteChange((newRoutePath) => {
  console.log('new route path', newRoutePath)
  // trigger page view
  analytics.page()
})
```

See more utils on [getanalytics.io](https://getanalytics.io/)