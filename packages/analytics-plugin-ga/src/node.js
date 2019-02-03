/**
 * Segment.com Node plugin
 */

let ua
if (!process.browser) {
  ua = require('universal-analytics')
}

const config = {}

const NAMESPACE = 'google-analytics'

let client

/* Export the integration */
export default function googleAnalytics(userConfig) {
  // Allow for userland overides of base methods
  return {
    NAMESPACE: NAMESPACE,
    config: {
      ...config,
      ...userConfig
    },
    initialize: ({ config }) => {
      client = ua(config.trackingId)
    },
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
