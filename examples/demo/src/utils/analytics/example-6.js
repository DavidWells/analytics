import Analytics from 'analytics'
import snowplowPlugin from '@analytics/snowplow'

/* initialize analytics and load plugins */
const analytics = Analytics({
  debug: true,
  app: 'myApp',
  plugins: [
    snowplowPlugin({
      name: 'snowplow',
      scriptSrc: 'https://cdn.jsdelivr.net/gh/snowplow/sp-js-assets@2.17.0/sp.js',
      collectorUrl: 'localhost:9090', //Consider using Snowplow Micro for easy testing
      trackerSettings: {
        appId: 'myApp',
        contexts: {
          webPage: true
        }
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
