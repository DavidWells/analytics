import React, { useEffect } from 'react'
import { useLocation } from "react-router-dom"
import analytics from '../../utils/analytics'

const PageViewTracking = () => {
  const location = useLocation()

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
    // register page view on route changes
    analytics.page(() => {
      console.log('page callback componentDidUpdate')
    })
  }, [location])

  return null
}

export default PageViewTracking
