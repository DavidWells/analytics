import Analytics from 'analytics'
import ownstatsPlugin from './plugins/ownstats'
// Include perfume.js analytics plugin
import perfumePlugin from '@analytics/perfumejs'
// Include perfume.js library
import Perfume from 'perfume.js'

/* initialize analytics and load plugins */
const analytics = Analytics({
  debug: true,
  app: 'yolo',
  plugins: [
    perfumePlugin({
      // Perfume.js class. If empty, window.Perfume will be used.
      perfume: Perfume,
      // Save bandwidth
      category: 'PM',
      // Analytics providers to send performance data.
      destinations: {
        // perf data will sent to Google Analytics
        'ownstats': true
      },
    }),
    ownstatsPlugin({
      endpoint: 'dkqe1t31741rq.cloudfront.net',
      useAutomation: false,
      debug: true
    })
  ]
})

// analytics.storage.setItem('wer', 'hi', 'cookie')

window.Analytics = analytics

/* export analytics for usage through the app */
export default analytics
