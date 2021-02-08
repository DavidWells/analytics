# Analytics SPA route utils

Utilities for listening to route changes in SPA.

## Basic Usage

```js
import onRouteChange from '@analytics/router-utils'

onRouteChange((newRoutePath) => {
  console.log('new route path', newRoutePath)
  // trigger page view
  analytics.page()
})
```