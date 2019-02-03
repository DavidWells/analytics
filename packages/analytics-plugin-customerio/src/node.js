/**
 * Customer.io Node Plugin
 */

let CustomerIO
if (!process.browser) {
  CustomerIO = require('customerio-node')
}

let cio

const config = {}

/* Export the integration */
export default function customerIOPlugin(userConfig) {
  // Allow for userland overides of base methods
  return {
    NAMESPACE: 'customerio',
    config: {
      ...config,
      ...userConfig
    },
    initialize: ({ config }) => {
      cio = new CustomerIO(config.siteId, config.apiKey)
    },
    // page view
    page: ({ payload, config }) => {
      const { userId, properties } = payload
      cio.trackPageView(userId, properties.url)
    },
    // track event
    track: ({ payload, config }) => {
      const { userId, event, properties } = payload
      cio.track(userId, {
        name: event,
        data: properties
      })
    },
    // identify user
    identify: ({ payload }) => {
      const { userId, traits } = payload
      cio.identify(userId, traits)
    }
  }
}
