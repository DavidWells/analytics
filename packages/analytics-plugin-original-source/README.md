# Analytics Original Source Plugin

> Track the initial traffic source of visitors to your site

## Usage

```bash
npm i analytics
npm i analytics-plugin-original-source
```

```js
import analyticsLib from 'analytics'
import originalSrc from 'analytics-plugin-original-source'

const analytics = analyticsLib({
  app: 'doggieDating',
  version: 100,
  debug: true,
  plugins: [
    originalSrc(),
  ]
})
```
