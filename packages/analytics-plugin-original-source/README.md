# Analytics Original Source Plugin

Track the initial traffic source of visitors to your site.

This plugin will save the original `__user_original_source` & `__user_original_landing_page` to localStorage and on the user properties in the sessions context.

**Example:**

```
__user_original_source = "source=(direct)|medium=(none)|campaign=(not set)"
__user_original_landing_page = "https://www.site.com/landing-page"
```

This data is handy when assigning attribution metrics.

## Usage

```bash
npm install analytics
npm install @analytics/original-source-plugin
```

```js
import Analytics from 'analytics'
import { originalSourcePlugin } from '@analytics/original-source-plugin'

const analytics = Analytics({
  app: 'my-app',
  version: 100,
  debug: true,
  plugins: [
    originalSourcePlugin(),
  ]
})
```

Replaces deprecated [analytics-plugin-original-source](https://www.npmjs.com/package/analytics-plugin-original-source) package.
