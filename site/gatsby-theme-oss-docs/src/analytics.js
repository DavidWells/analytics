import Analytics from 'analytics'
import googleAnalytics from 'analytics-plugin-ga'

const analytics = Analytics({
  plugins: [
    googleAnalytics({
      trackingId: 'UA-126647663-4'
    }),
  ]
})

analytics.on('page', ({ payload }) => {
  console.log('page view fired', payload)
})

analytics.on('track', ({ payload }) => {
  console.log('track', payload)
})

// Set to global so Gatsby analytics plugin will work
if (typeof window !== 'undefined') {
  window.Analytics = analytics
}

export default analytics
