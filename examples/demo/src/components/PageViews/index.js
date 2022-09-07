import React from 'react'
import { Location } from "@reach/router"
import analytics from '../../utils/analytics'

class PageViews extends React.Component {
  componentDidMount() {
    analytics.on('pageStart', ({ payload }) => {
      console.log('pageStart', payload)
    })
    // register page view on load
    analytics.page(() => {
      console.log('page callback initial')
    })
  }
  componentDidUpdate(prevProps) {
    if (prevProps.href !== this.props.href) {
      // register page view on route changes
      analytics.page(() => {
        console.log('page callback componentDidUpdate')
      })
    }
  }
  render() {
    return null
  }
}

const PageViewTracking = () => {
  return (
    <Location>
      {({ location }) => (
        <PageViews href={location.href} />
      )}
    </Location>
  )
}

export default PageViewTracking
