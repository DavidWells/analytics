# Analytics Referral Source Plugin

> Track the initial traffic source of visitors to your site

## Usage

```bash
npm i analytics
npm i analytics-plugin-referral-src
```

```js
import analyticsLib from 'analytics'
import referralSrc from 'analytics-plugin-referral-src'

const analytics = analyticsLib({
  app: 'doggieDating',
  version: 100,
  debug: true,
  plugins: [
    referralSrc(),
  ]
})
```
