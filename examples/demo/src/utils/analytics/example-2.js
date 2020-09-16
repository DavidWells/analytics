import Analytics from 'analytics'
import goSquared from '@analytics/gosquared'
import googleAnalytics from '@analytics/google-analytics'
import exampleProviderPlugin from './plugins/provider-example'

const googleAnalyticsInstanceTwo = {
  ...googleAnalytics({
    trackingId: 'UA-126647663-6',
    instanceName: 'two'
  }),
  ...{
    // rename plugin to avoid namespace collisions
    name: 'google-analytics-two'
  }
}
/* initialize analytics and load plugins */
const analytics = Analytics({
  debug: true,
  app: 'yolo',
  plugins: [
    {
      name: 'hahahaa',
      track: () => {
        console.log('hi one')
      }
    },
    {
      NAMESPACE: 'hello',
      track: () => {
        console.log('hi two')
      }
    },
    exampleProviderPlugin({
      settingOne: 'xyz'
    }),
    googleAnalytics({
      trackingId: process.env.REACT_APP_GOOGLE_ANALYTICS_ID,
      // Custom dimensions mapping example
      customDimensions: {
        baz: 'dimension1',
        foo: 'dimension2',
      },
      resetCustomDimensionsOnPage: ['foo']
    }),
    googleAnalyticsInstanceTwo
  ]
})

// analytics.storage.setItem('wer', "hi", 'cookie')

window.Analytics = analytics

/* export analytics for usage through the app */
export default analytics
