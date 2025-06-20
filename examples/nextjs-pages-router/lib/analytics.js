import Analytics from "analytics"
import googleAnalytics from '@analytics/google-analytics'

const analyticsInstance = Analytics({
  app: "nextjs-pages-router",
  debug: true,
  plugins: [
    googleAnalytics({
      measurementIds: ['G-abc123']
    }),
    {
      name: 'logger',
      trackPageViews: true,
      page: (payload) => {
        console.log('Page view fired', payload)
      },
      track: (payload) => {
        console.log('Track fired', payload)
      }
    }
  ],
})

export default analyticsInstance