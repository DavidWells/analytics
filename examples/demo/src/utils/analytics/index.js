import Analytics from 'analytics'
import googleAnalytics from 'analytics-plugin-ga'
import segmentPlugin from 'analytics-plugin-segment'
import doNotTrack from 'analytics-plugin-do-not-track'
import exampleProviderPlugin from './plugins/provider-example'
import visualizeLifecycle from './plugins/visualize-analytics'

const reduxPlugin = store => next => action => {
  if (action.type === 'page:segment') {
    console.log('Other one!')
  }
  return next(action)
}

/* initialize analytics and load plugins */
const analytics = Analytics({
  debug: true,
  plugins: [
    visualizeLifecycle(),
    // doNotTrack({
    //   enabled: true
    // }),
    segmentPlugin({
      writeKey: 'f3W8BZ0iCGrk1STIsMZV7JXfMGB7aMiW',
      disableAnonymousTraffic: true,
    }),
    exampleProviderPlugin({
      settingOne: 'xyz'
    }),
    googleAnalytics({
      trackingId: process.env.REACT_APP_GOOGLE_ANALYTICS_ID
    }),
    reduxPlugin,
    {
      NAMESPACE: 'custom',
      customEvent: () => {
        alert('yo')
      }
    }
  ]
})

window.Analytics = analytics

/* export analytics for usage through the app */
export default analytics
