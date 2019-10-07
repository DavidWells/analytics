---
title: CrazyEgg
description: Using the CrazyEgg plugin
---

Integration with [crazy egg](https://www.crazyegg.com/) for [analytics](https://www.npmjs.com/package/analytics)

## Install

```bash
npm install analytics
npm install @analytics/crazy-egg
```

## Usage

Include `analytics` and `@analytics/crazy-egg` in the source code of your project.

Initialize analytics with the crazy-egg plugin and the crazy-egg heat mapping script will be automatically loaded into the page.

```js
import Analytics from 'analytics'
import crazyEgg from '@analytics/crazy-egg'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    crazyEgg({
      accountNumber: '12345678'
    }),
    // ... other plugins
  ]
})

// Crazy egg now loaded
```

See the [full list of analytics provider plugins](https://github.com/DavidWells/analytics#current-plugins) in the main repo.
