import Analytics from 'analytics'
import goSquared from '@analytics/gosquared'
import googleAnalytics from '@analytics/google-analytics'
import exampleProviderPlugin from './plugins/provider-example'


/* initialize analytics and load plugins */
const analytics = Analytics({
  debug: true,
  app: 'yolo',
  plugins: [
    {
      name: 'hahahaa',
      track: () => {
        console.log('hi')
      }
    },
    {
      NAMESPACE: 'hello',
      track: () => {
        console.log('hi')
      }
    },
    exampleProviderPlugin({
      settingOne: 'xyz'
    }),
    googleAnalytics({
      trackingId: process.env.REACT_APP_GOOGLE_ANALYTICS_ID,
    }),
    // goSquared({
    //   projectToken: 'GSN-722377-Y'
    // })
  ]
})

// analytics.storage.setItem('wer', "hi", 'cookie')

window.Analytics = analytics

/* export analytics for usage through the app */
export default analytics
