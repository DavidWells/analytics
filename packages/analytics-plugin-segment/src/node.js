/**
 * Segment.com Node plugin
 * https://github.com/segmentio/analytics-node
 */

let Analytics
if (!process.browser) {
  Analytics = require('analytics-node')
}

const config = {}

const NAMESPACE = 'segment'

let client

/* Export the integration */
export default function googleTagManager(userConfig) {
  // Allow for userland overides of base methods
  return {
    NAMESPACE: NAMESPACE,
    config: {
      ...config,
      ...userConfig
    },
    initialize: ({ config }) => {
      client = new Analytics(config.writeKey)
    },
    // page view
    page: ({ payload, config }) => {
      client.page({
        properties: payload.properties
      })
    },
    // track event
    track: ({ payload, config }) => {
      // @Todo include userId
      client.track({
        // userId: '019mr8mf4r',
        event: payload.event,
        properties: payload.properties
      })
    },
    // identify user
    identify: ({ payload }) => {
      const { userId, traits } = payload
      client.identify({ userId, traits })
    }
  }
}
