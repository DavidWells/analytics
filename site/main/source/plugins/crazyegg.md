---
title: CrazyEgg
description: Using the CrazyEgg plugin
---

Integration with [crazy egg](https://www.crazyegg.com/) for [analytics](https://www.npmjs.com/package/analytics)

## Install

```bash
npm install analytics-plugin-crazy-egg
```

## Usage

```js
import Analytics from 'analytics'
import crazyEgg from 'analytics-plugin-crazy-egg'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    crazyEgg({
      accountNumber: '12345678'
    }),
  ]
})

// Crazy egg now loaded
```

See the [full list of analytics provider plugins](https://github.com/DavidWells/analytics#current-plugins) in the main repo.
