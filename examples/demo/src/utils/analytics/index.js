import Analytics from 'analytics'
import googleAnalytics from 'analytics-plugin-ga'
import visualizeLifecycle from './plugins/visualize-analytics'

/* initialize analytics and load plugins */
const analytics = Analytics({
  plugins: [
    visualizeLifecycle(),
    googleAnalytics({
      trackingId: '1111111'
    })
  ]
})

/* export analytics for usage through the app */
export default analytics
