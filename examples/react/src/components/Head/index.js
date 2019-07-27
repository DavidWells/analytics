// ref https://github.com/joernroeder/piwik-react-router/issues/45#issuecomment-444890480
import React from 'react'
import Helmet from 'react-helmet'
import analytics from '../../analytics'

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

const CustomHelmet = ({ children }) => (
  <Helmet onChangeClientState={handlePageView}>
    {children}
  </Helmet>
)

export default CustomHelmet
