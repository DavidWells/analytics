# Crazy Egg Plugin for `analytics`

Integration with [crazy egg](https://www.crazyegg.com/) for [analytics](https://www.npmjs.com/package/analytics)

For more information [see the docs](https://getanalytics.io/plugins/crazyegg/).

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
import crazyEggPlugin from '@analytics/crazy-egg'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    crazyEggPlugin({
      accountNumber: '12345678'
    }),
  ]
})

// Crazy egg now loaded!
```

See the [full list of analytics provider plugins](https://getanalytics.io/plugins/) in the main repo.
