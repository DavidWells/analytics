import Helmet from 'react-helmet'
import PropTypes from 'prop-types'
import React from 'react'
import socialImage from '../assets/images/social.jpg'

export default function SEO({ title, description, siteName, pathname }) {
  // TODO clean up logic

  let image = `https://getanalytics.io${socialImage}`
  if (pathname.match(/^\/plugins\//)) {
    const cleanName = pathname.replace(/^\/plugins\//, '').replace(/\/$/, '')
    const ignore = ['request', 'event-validation', 'do-not-track', 'tab-events', 'original-source', 'window-events']
    if (!ignore.includes(cleanName)) {
      image = `https://d36ubspakw5kl4.cloudfront.net/${cleanName}.png`
    }
  }

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@analytics" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta
        name="twitter:image"
        content={image}
      />
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
