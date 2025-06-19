import React, { useEffect, useRef } from 'react'
import { useLocation } from "react-router-dom"
import analytics from '../../utils/analytics'

const PageViewTracking = () => {
  const location = useLocation()
  const isInitialMount = useRef(true)

  useEffect(() => {
    analytics.on('pageStart', ({ payload }) => {
      console.log('pageStart', payload)
    })
    // register page view on load
    analytics.page(() => {
      console.log('page callback initial')
    })
  }, [])

  useEffect(() => {
    // Skip the initial mount to avoid duplicate page tracking
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    
    // register page view on route changes
    console.log('location', location)
    analytics.page(() => {
      console.log('page callback componentDidUpdate')
    })
  }, [location])

  return null
}

export default PageViewTracking
