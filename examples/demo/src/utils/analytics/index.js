import Analytics from 'analytics'
import googleAnalytics from 'analytics-plugin-ga'
import exampleProviderPlugin from './plugins/provider-example'
import visualizeLifecycle from './plugins/visualize-analytics'

/* initialize analytics and load plugins */
const analytics = Analytics({
  plugins: [
    visualizeLifecycle(),
    exampleProviderPlugin({
      settingOne: 'xyz'
    }),
    googleAnalytics({
      trackingId: process.env.REACT_APP_GOOGLE_ANALYTICS_ID
    })
  ]
})

window.Analytics = analytics

/* export analytics for usage through the app */
export default analytics
