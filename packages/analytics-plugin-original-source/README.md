# Analytics Original Source Plugin

> Track the initial traffic source of visitors to your site

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
