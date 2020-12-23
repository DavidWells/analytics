import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'

const customGA = googleAnalytics({
  trackingId: process.env.REACT_APP_GOOGLE_ANALYTICS_ID,
})

/* initialize analytics and load plugins */
const analytics = Analytics({
  debug: true,
  app: 'yolo',
  plugins: [
    {
      ...customGA,
      enabled: false,
    },
    {
      name: 'plugin-x',
      enabled: false,
      initialize: () => {
        console.log('FIRE INIT FROM PLUGIN X')
      },
      page: ({ payload }) => console.log('plugin-x page view', payload),
    },
    {
      name: 'plugin-y',
      enabled: false,
      page: ({ payload }) => console.log('plugin-y page view', payload),
    },
    {
      name: 'plugin-1',
      initialize: () => {
        console.log('1')
      },
      page: ({ payload }) => console.log('plugin-1 page view', payload),
    },
    {
      name: 'plugin-2',
      initialize: () => {
        console.log('2')
      },
      page: ({ payload }) => console.log('plugin-2 page view', payload)
    },
  ]
})

export default analytics
