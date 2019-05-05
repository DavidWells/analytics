/**
 * Customer.io Node Plugin
 * uses https://github.com/customerio/customerio-node
 */

let CustomerIO
if (!process.browser) {
  CustomerIO = require('customerio-node')
}

const config = {
  /* Customer.io site ID */
  siteId: null,
  /* Customer.io API key */
  apiKey: null,
}

/* Export the integration */
export default function customerIOPlugin(userConfig) {
  // Allow for userland overides of base methods
  const cioConfig = {
    ...config,
    ...userConfig
  }

  const cio = new CustomerIO(cioConfig.siteId, cioConfig.apiKey)

  return {
    NAMESPACE: 'customerio',
    config: cioConfig,
    // page view
    page: ({ payload, config }) => {
      const { userId, properties } = payload
      if (!userId) return false

      cio.trackPageView(userId, properties.url)
    },
    // track event
    track: ({ payload, config }) => {
      const { userId, event, properties } = payload
      if (!userId) return false

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
