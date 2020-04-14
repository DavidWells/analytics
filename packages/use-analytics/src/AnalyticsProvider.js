import React from 'react'
import invariant from 'tiny-invariant'
import AnalyticsContext from './AnalyticsContext'

const AnalyticsProvider = ({ children, instance }) => {
  invariant(instance, `Analytics instance not provided to <AnalyticsProvider />`)
  return (
    <AnalyticsContext.Provider
      value={instance}
      children={children || null}
    />
  )
}

export default AnalyticsProvider
