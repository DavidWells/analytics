import Analytics from 'analytics'
import segmentPlugin from '@analytics/segment'

/* initialize analytics and load plugins */
const analytics = Analytics({
  debug: true,
  plugins: [
    segmentPlugin({
      writeKey: 'TpKoFHqy1g98bXjd3wdVp3JvkHJRl5Q5',
      disableAnonymousTraffic: true,
    }),
    exampleProviderPlugin({
      xyz: '123'
    })
  ]
})

/* This is an example plugin */
function exampleProviderPlugin(userConfig = {}) {
  return {
    NAMESPACE: 'provider-example',
    config: userConfig,
    initialize: ({ payload }) => {
      console.log('Load stuff')
    },
    page: ({ payload }) => {
      console.log(`Example Page > [payload: ${JSON.stringify(payload, null, 2)}]`)
    },
    /* Track event */
    track: ({ payload }) => {
      console.log(`Example Track > [${payload.event}] [payload: ${JSON.stringify(payload, null, 2)}]`)
    },
    /* Identify user */
    identify: ({ payload }) => {
      console.log(`Example identify > [payload: ${JSON.stringify(payload, null, 2)}]`)
    },
    loaded: () => {
      return true
    },
    ready: () => {
      console.log('ready: exampleProviderPlugin')
    }
  }
}

window.Analytics = analytics

/* export analytics for usage through the app */
export default analytics
