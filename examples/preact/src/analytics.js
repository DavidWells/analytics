import Analytics from 'analytics'
import googleAnalytics from 'analytics-plugin-ga'

const analytics = Analytics({
  app: 'app-name',
  debug: true,
  plugins: [
    googleAnalytics({
      trackingId: 'UA-126647663-2',
      autoTrack: true,
    }),
  ]
})

export default analytics
