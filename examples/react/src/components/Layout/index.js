import React, { Component } from 'react'
import Helmet from 'react-helmet'
import GitHubCorner from '../GithubCorner'
import analytics from '../../analytics'

/* Using react-helmet onChangeClientState */
let previousTitle
const handlePageView = (newState) => {
  if (previousTitle !== newState.title) {
    console.log(`react-helmet onChangeClientState "${newState.title}"`)
    // Run page view!
    analytics.page(() => {
      console.log('Page callback from CustomHelmet')
    })
    // set previousTitle
    previousTitle = newState.title
  }
}

export default class Layout extends Component {
  render() {
    const { children, title } = this.props
    return (
      <div className="wrapper">
        <Helmet onChangeClientState={handlePageView}>
          <meta charSet="utf-8" />
          <title>{title || 'Default page title'}</title>
        </Helmet>
        <GitHubCorner url='https://github.com/davidwells/analytics' />
        {children}
      </div>
    )
  }
}
