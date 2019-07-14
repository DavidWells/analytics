import Helmet from 'react-helmet'
import PropTypes from 'prop-types'
import React from 'react'

export default function SEO({title, description, siteName}) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta property="og:title" content={title} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:description" content={description} />
      {/* <meta property="og:image" content={socialImage} /> */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@apollographql" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {/* <meta
        name="twitter:image"
        content={'https://apollographql.com' + socialImage}
      />
      */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/docsearch.js@2/dist/cdn/docsearch.min.css"
      />
    </Helmet>
  )
}

SEO.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  siteName: PropTypes.string.isRequired
}
