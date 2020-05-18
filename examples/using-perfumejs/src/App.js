import React from 'react'
import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'
import segmentPlugin from '@analytics/segment'
import customAnalyticsPlugin from './plugins/custom'
import perfumePlugin from './plugins/perfume'
import './App.css'

/**
 * Initialize analytics with perfumejs plugin and include any
 * third party analytics tool you'd like the perf data to be sent to
 */
const analytics = Analytics({
  app: 'my-app-name',
  plugins: [
    perfumePlugin({
      category: 'perfMetrics'
    }),
    // Custom plugins to now send perf data to
    customAnalyticsPlugin,
    // Send perfume.js data to GA
    googleAnalytics({
      trackingId: 'UA-1234567' // <--- your GA ID
    }),
    // Send perfume.js data to segment
    segmentPlugin({
      writeKey: '123-xyz'  // <--- your segment key
    })
    // ... etc. Any analytics plugin with `track` call will work https://getanalytics.io/plugins/
  ]
})

export default function App() {
  /* Other analytics method are now also available for use
  // Track page views
  analytics.page()

  // Identify users
  analytics.identify('userid-123', {
    favoriteColor: 'blue',
    membershipLevel: 'pro'
  })

  // Track events
  analytics.track('buttonClicked', {
    value: 100
  })
  */
  return (
    <div className="App">
      <h1>Using perfume.js with analytics</h1>
      <p>Perfume is a tiny, web performance monitoring library that reports field data back to your favorite analytics tool.</p>
      <p>Open the console to see perf metrics sending sent</p>
      <a href="https://zizzamia.github.io/perfume/">Read more about perfume.js</a>
    </div>
  )
}
