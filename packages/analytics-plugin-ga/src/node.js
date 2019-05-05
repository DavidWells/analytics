/**
 * Segment.com Node plugin
 */

let ua
if (!process.browser) {
  ua = require('universal-analytics')
}

const config = {
  /* Your site tracking ID */
  trackingId: null
}

const NAMESPACE = 'google-analytics'

/* Export the integration */
export default function googleAnalytics(userConfig) {
  const gaSettings = {
    ...config,
    ...userConfig
  }
  const client = ua(gaSettings.trackingId)
  return {
    NAMESPACE: NAMESPACE,
    config: gaSettings,
    // page view
    page: ({ payload, config }) => {
      const { properties } = payload
      const { path, href, title } = properties
      if (!path || !href || !title) {
        throw new Error('Missing path, href or title in page call for GA')
      }
      client.pageview(path, href, title).send()
    },
    // track event
    track: ({ payload, config }) => {
      const { event, properties } = payload
      const category = properties.category || 'All' // todo finish
      const label = properties.label || 'NA' // todo finish
      client.event(category, event, label, properties).send()
    },
    // identify user
    // identify: ({ payload }) => {
    //   const { userId, traits } = payload
    //   client.identify({ userId, traits })
    // }
  }
}
