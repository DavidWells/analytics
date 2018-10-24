# Google analytics plugin for `analytics`

Integration with google analytics for [analytics](https://www.npmjs.com/package/analytics)

## Install

```bash
npm install analytics-plugin-ga --save
```

## Usage

```js
import analytics from 'analytics'
import googleAnalytics from 'analytics-plugin-ga'

const plugins = [
  // GA integration
  googleAnalytics({
    trackingId: 'UA-121991291',
    autoTrack: true,
  }),
]

const analyticsInstance = analytics({
  app: 'doggieDating',
  version: 100,
  plugins: plugins
})
```

See the [full list of analytics provider plugins](https://github.com/DavidWells/analytics#current-plugins) in the main repo.
