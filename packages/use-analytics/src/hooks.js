import { useContext } from 'react'
import AnalyticsContext from './AnalyticsContext'

export const useAnalytics = () => {
  return useContext(AnalyticsContext)
}

export const useTrack = () => {
  return useContext(AnalyticsContext).track
}

export const usePage = () => {
  return useContext(AnalyticsContext).page
}

export const useIdentify = () => {
  return useContext(AnalyticsContext).identify
}
