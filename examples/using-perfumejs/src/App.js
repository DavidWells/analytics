import React from 'react'
import Analytics from 'analytics'
import Perfume from 'perfume.js'
import googleAnalytics from '@analytics/google-analytics'
import perfumePlugin from '@analytics/perfumejs'
import customAnalyticsPlugin from './plugins/custom'
import './App.css'

/**
 * Initialize analytics with perfumejs plugin and include any
 * third party analytics tool you'd like the perf data to be sent to
 */
const analytics = Analytics({
  app: 'my-app',
  plugins: [
    {
      name: 'test-plugin',
      track: ({ payload }) => {
        console.log('payload', payload)
        // Send perf information to your own backend API here 
      }
    },
    // Custom plugins to now send perf data to
    customAnalyticsPlugin,
    googleAnalytics({
      trackingId: 'UA-126647663-7'
    }),
    perfumePlugin({
      category: 'perf',
      perfume: Perfume
    }),
  ]
})

export default function App() {
  return (
    <div className="App">
      <h1>Using perfume.js with analytics</h1>
      <p>Perfume is a tiny, web performance monitoring library that reports field data back to your favorite analytics tool.</p>
      <p>Open the console to see perf metrics sending sent</p>
      <a href="https://zizzamia.github.io/perfume/">Read more about perfume.js</a>
      <br/><br/><br/>
      <div>
        <button onClick={() => analytics.track('buttonClicked', { color: 'blue' })}>
          Track
        </button>
        <button onClick={() => analytics.identify('user-xyz')}>
          Identify
        </button>
        <button onClick={() => analytics.page()}>
          Page View
        </button>
      </div>
    </div>
  )
}
