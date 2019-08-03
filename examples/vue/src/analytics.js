import Analytics from 'analytics'
import googleAnalytics from 'analytics-plugin-ga'

const analytics = Analytics({
  app: 'my-vue-app',
  debug: true,
  plugins: [
    googleAnalytics({
      trackingId: 'UA-126647663-5',
      autoTrack: true,
    }),
  ]
})

export default analytics
