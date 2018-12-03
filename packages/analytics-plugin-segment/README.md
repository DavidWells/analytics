# Segment plugin for `analytics`

Integration with segment for [analytics](https://www.npmjs.com/package/analytics)

## Install

```bash
npm install analytics-plugin-segment --save
```

## Usage

```js
import analytics from 'analytics'
import segment from 'analytics-plugin-segment'

const analyticsInstance = analytics({
  app: 'doggieDating',
  version: 100,
  plugins: [
    // segment integration
    segment({
      trackingId: 'abc12345xyz'
    }),
  ]
})
```

See the [full list of analytics provider plugins](https://github.com/DavidWells/analytics#current-plugins) in the main repo.
