import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'

/* initialize analytics and load plugins */
const analytics = Analytics({
  debug: true,
  app: 'yolo',
  version: '1.2.0',
  plugins: [
    googleAnalytics({
      measurementIds: ['G-RL2P3ZC6B2'],
      // gtagConfig: {
      //   send_page_view: true,
      // }
      // debug: true
    }),
  ]
})

export default analytics
