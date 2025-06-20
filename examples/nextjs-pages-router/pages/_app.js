import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { Inter } from 'next/font/google'
import { AnalyticsProvider } from 'use-analytics'
import analyticsInstance from '../lib/analytics'
import '../styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

/**
 * Main App component for Pages Router
 * @param {Object} props - Component props
 * @param {React.ComponentType} props.Component - Page component
 * @param {Object} props.pageProps - Page props
 * @returns {JSX.Element}
 */
export default function App({ Component, pageProps }) {
  const router = useRouter()

  useEffect(() => {
    // Track page views on route change
    const handleRouteChange = () => {
      analyticsInstance.page()
    }

    // Track the initial page load
    analyticsInstance.page()

    // Listen for route changes
    router.events.on('routeChangeComplete', handleRouteChange)

    // Clean up event listener
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  return (
    <AnalyticsProvider instance={analyticsInstance}>
      <div className={inter.className}>
        <Component {...pageProps} />
      </div>
    </AnalyticsProvider>
  )
}