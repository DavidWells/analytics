import React from 'react'
import invariant from 'tiny-invariant'
import hoistStatics from 'hoist-non-react-statics'
import AnalyticsContext from './AnalyticsContext'

/**
 * A public higher-order component to access the imperative API
 */
export default function withAnalytics(Component) {
  const displayName = `withAnalytics(${Component.displayName || Component.name})`
  const C = props => {
    const { wrappedComponentRef, ...remainingProps } = props

    return (
      <AnalyticsContext.Consumer>
        {context => {
          invariant(context, `You should not use ${displayName} outside of a <AnalyticsProvider>`)
          return (
            <Component
              {...remainingProps}
              analytics={context}
              ref={wrappedComponentRef}
            />
          )
        }}
      </AnalyticsContext.Consumer>
    )
  }

  C.displayName = displayName
  C.WrappedComponent = Component

  return hoistStatics(C, Component)
}
