---
title: Original Source
description: Using the original src plugin
---

> Track the initial traffic source of visitors to your site

This plugin will save the original `__user_original_source` & `__user_original_landing_page` to localStorage and on the user properties.

**Example:**

```
__user_original_source = "source=(direct)|medium=(none)|campaign=(not set)"
__user_original_landing_page = "https://www.site.com/landing-page"
```

This data is handy when assigning attribution metrics.

## Usage

```bash
npm install analytics
npm install analytics-plugin-original-source
```

```js
import Analytics from 'analytics'
import originalSrc from 'analytics-plugin-original-source'

const analytics = Analytics({
  app: 'my-app',
  version: 100,
  debug: true,
  plugins: [
    originalSrc(),
  ]
})
```
