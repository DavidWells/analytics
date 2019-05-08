import Analytics from 'analytics'
import googleAnalytics from 'analytics-plugin-ga'
import segmentPlugin from 'analytics-plugin-segment'
import doNotTrack from 'analytics-plugin-do-not-track'
import tabEvents from 'analytics-plugin-tab-events'
import windowEvents from 'analytics-plugin-window-events'
import customerIoPlugin from 'analytics-plugin-customerio'
import exampleProviderPlugin from './plugins/provider-example'
import visualizeLifecycle from './plugins/visualize-analytics'

const reduxPlugin = store => next => action => {
  if (action.type === 'page:segment') {
    console.log('Other one!')
  }
  return next(action)
}

var tabInterval

/* initialize analytics and load plugins */
const analytics = Analytics({
  debug: true,
  plugins: [
    visualizeLifecycle(),
    tabEvents(),
    // windowEvents(),
    // doNotTrack({
    //   enabled: true
    // }),
    customerIoPlugin({
      siteId: '4dfdba9c7f1a6d60f779'
    }),
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
      tabHidden: () => {
        console.log('TAB HIDDEN')
        var tabHiddenCount = 0
        tabInterval = setInterval(() => {
          console.log(tabHiddenCount++)
        }, 500)
      },
      tabVisible: () => {
        console.log('Tab Now visible again')
        clearInterval(tabInterval)
      },
      tabHiddenEnd: () => {
        console.log('TAB HIDDEN Last')
      }
    },
    {
      NAMESPACE: 'custom-two',
      tabHidden: () => {
        console.log('TAB HIDDEN 2')
      },
      tabHiddenEnd: () => {
        console.log('TAB HIDDEN Last 2')
      }
    }
  ]
})

window.Analytics = analytics

/* export analytics for usage through the app */
export default analytics
