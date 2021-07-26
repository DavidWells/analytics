---
title: SPA Router Utilities
pageTitle: Router Utils
description: Utility library for single page app routing
---

A tiny (<!-- AUTO-GENERATED-CONTENT:START (pkgSize) -->`584 bytes`<!-- AUTO-GENERATED-CONTENT:END -->) routing utility for listening to route changes in single page applications.

## Install

```bash
npm install @analytics/router-utils
```

## Usage

```js
import onRouteChange from '@analytics/router-utils'
import analytics from './analytics'

onRouteChange((newRoutePath) => {
  console.log('new route path', newRoutePath)
  // trigger page view
  analytics.page()
})
```