import Analytics from 'analytics'
import snowplowPlugin from '@analytics/snowplow'

/* initialize analytics and load plugins */
const analytics = Analytics({
  debug: true,
  app: 'myApp',
  plugins: [
    snowplowPlugin({
      name: 'snowplow',
      collectorUrl: 'localhost:9090', //Consider using Snowplow Micro for easy testing
      trackerSettings: {
        appId: 'myApp'
      }
    })
  ]
})

analytics.on('initialize:snowplow', ({instance}) => {
  instance.plugins.snowplow.enableActivityTracking(10,10);
  instance.plugins.snowplow.enableLinkClickTracking();
});

window.Analytics = analytics

/* export analytics for usage through the app */
export default analytics
