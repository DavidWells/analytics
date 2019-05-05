# Segment plugin for `analytics`

Integration with [segment](https://segment.com/) for [analytics](https://www.npmjs.com/package/analytics)

## Install

```
npm install analytics
npm install analytics-plugin-segment
```

## Usage

```js
import analytics from 'analytics'
import segmentPlugin from 'analytics-plugin-segment'

const analyticsInstance = analytics({
  app: 'my-app',
  version: 100,
  plugins: [
    /* segment integration */
    segmentPlugin({
      trackingId: 'abc12345xyz'
    }),
    // ...other plugins
  ]
})
```

See the [full list of analytics provider plugins](https://github.com/DavidWells/analytics#current-plugins) in the main repo.
