---
title: Saving the original source & referral information of a visitor in analytics
description: Plugin to save original attribution data of a website visitor including referral information & first page visited
pageTitle: Original Source
subTitle: Using the original src plugin
---

Track the initial traffic source of visitors to your site.

This plugin will save the original referral source of visitors and the first page they came in on.

The following values are saved to localStorage:

- `__user_original_source`
- `__user_original_landing_page`

These pieces of information can be very useful when assigning attribution data to users.

**Example:**

```
__user_original_source = "source=(direct)|medium=(none)|campaign=(not set)"
__user_original_landing_page = "https://www.site.com/landing-page"
```

## How to use

Install the plugins from npm.

```bash
npm install analytics
npm install analytics-plugin-original-source
```

Then include it in your `analytics` instance

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
