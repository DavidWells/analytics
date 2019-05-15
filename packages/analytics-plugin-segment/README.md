# Segment plugin for `analytics`

Integration with [segment](https://segment.com/) for [analytics](https://www.npmjs.com/package/analytics)

## Install

```
npm install analytics
npm install analytics-plugin-segment
```

## Usage

```js
import Analytics from 'analytics'
import segmentPlugin from 'analytics-plugin-segment'

const analytics = Analytics({
  app: 'my-app',
  version: 100,
  plugins: [
    /* segment integration */
    segmentPlugin({
      writeKey: 'abc12345xyz'
    }),
    // ...other plugins
  ]
})

// Send tracking event
analytics.track('buttonPressed', {
  label: 'buy now'
})
```

See the [full list of analytics provider plugins](https://github.com/DavidWells/analytics#current-plugins) in the main repo.
