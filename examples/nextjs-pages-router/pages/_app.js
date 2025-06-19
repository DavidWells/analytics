import '@/styles/globals.css'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Analytics from 'analytics'
import { AnalyticsProvider } from 'use-analytics'
import googleAnalytics from '@analytics/google-analytics'

const analyticsInstance = Analytics({
  app: 'nextjspagesexample',
  debug: true,
  plugins: [
    googleAnalytics({
      measurementIds: ['G-abc123']
    })
  ],
})

export default function App({ Component, pageProps }) {
  const router = useRouter()

  useEffect(() => {
    const handleRouteChange = () => {
      analyticsInstance.page()
    }

    // Track page view on initial load
    analyticsInstance.page()

    // Track page views on route changes
    router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  return (
    <AnalyticsProvider instance={analyticsInstance}>
      <Component {...pageProps} />
    </AnalyticsProvider>
  )
}