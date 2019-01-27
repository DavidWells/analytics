import React from 'react'
import { Location } from "@reach/router"
import analytics from '../../utils/analytics'

class PageViews extends React.Component {
  componentDidMount() {
    // register page view on load
    analytics.page()
  }
  componentDidUpdate(prevProps) {
    if (prevProps.href !== this.props.href) {
      // register page view on route changes
      analytics.page()
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
