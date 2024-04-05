import '@apollo/space-kit/reset.css'
import '../styles.less' // eslint-disable-line sort-imports-es6-autofix/sort-imports-es6
import Helmet from 'react-helmet'
import PropTypes from 'prop-types'
import React, {Fragment} from 'react'
import {StaticQuery, graphql, withPrefix} from 'gatsby'

export default function Layout(props) {
  return (
    <StaticQuery
      query={graphql`
        {
          site {
            siteMetadata {
              title
              description
            }
          }
        }
      `}
      render={data => {
        const { title } = data.site.siteMetadata
        return (
          <Fragment>
            <Helmet defaultTitle={title}>
              <link rel="icon" href={withPrefix('/favicon.ico')} />
            </Helmet>
            {props.children}
            <div className='ad-container' id="ads" dangerouslySetInnerHTML={{
              __html: `<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CWYIE2JU&placement=getanalyticsio&format=cover" id="_carbonads_js"></script>`
            }} />
          </Fragment>
        )
      }}
    />
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired
}
