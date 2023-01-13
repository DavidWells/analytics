import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'

const analytics = Analytics({
  app: 'my-vue-app',
  debug: true,
  plugins: [
    googleAnalytics({
      measurementIds: 'UA-126647663-5',
      autoTrack: true,
    }),
  ]
})

export default analytics
