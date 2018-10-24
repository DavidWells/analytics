# Customer.io plugin for `analytics`

Integration with [customer.io](https://customer.io/) for [analytics](https://www.npmjs.com/package/analytics) package.

## Install

```bash
npm install analytics-plugin-customerio --save
```

## Usage

```js
import analytics from 'analytics'
import customerIO from 'analytics-plugin-customerio'

const plugins = [
  customerIO({
    siteId: '4dfdbaxyz12360f779'
  }),
  // ... other plugins
]

const analyticsInstance = analytics({
  app: 'doggieDating',
  version: 100,
  plugins: plugins
})
```

See the [full list of analytics provider plugins](https://github.com/DavidWells/analytics#current-plugins) in the main repo.
