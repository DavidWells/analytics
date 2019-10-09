import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'

const analytics = Analytics({
  app: 'app-name',
  debug: true,
  plugins: [
    googleAnalytics({
      trackingId: 'UA-126647663-2',
    }),
  ]
})

export default analytics
