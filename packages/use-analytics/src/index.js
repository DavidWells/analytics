import AnalyticsProvider from './AnalyticsProvider'
import AnalyticsContext from './AnalyticsContext'
import withAnalytics from './withAnalytics'
import { useAnalytics, useTrack, usePage, useIdentify } from './hooks'

const AnalyticsConsumer = AnalyticsContext.Consumer

export {
  AnalyticsProvider,
  AnalyticsConsumer,
  AnalyticsContext,
  // HigherOrder Component
  withAnalytics,
  // React hooks
  useAnalytics,
  useTrack,
  usePage,
  useIdentify
}
