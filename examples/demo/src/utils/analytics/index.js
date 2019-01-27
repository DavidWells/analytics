import Analytics from 'analytics'
import googleAnalytics from 'analytics-plugin-ga'
import visualizeLifecycle from './plugins/visualize-analytics'

/* initialize analytics and load plugins */
const analytics = Analytics({
  plugins: [
    visualizeLifecycle(),
    googleAnalytics({
      trackingId: process.env.REACT_APP_GOOGLE_ANALYTICS_ID
    })
  ]
})

/* export analytics for usage through the app */
export default analytics
