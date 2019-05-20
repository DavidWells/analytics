/* import serverside SDK */
let CustomerIO
if (!process.browser) {
  CustomerIO = require('customerio-node')
}

/* Default configuration */
const config = {
  /* Customer.io site ID */
  siteId: null,
  /* Customer.io API key */
  apiKey: null,
}

/**
 * Customer.io analytics server side integration. Uses https://github.com/customerio/customerio-node
 * @link https://customer.io/docs/api/
 * @param {object} pluginConfig - Plugin settings
 * @param {string} pluginConfig.siteId - Customer.io site Id for server side tracking
 * @param {string} pluginConfig.apiKey - Customer.io API key for server side tracking
 * @return {object} Analytics plugin
 *
 * @example
 *
 * customerIOPlugin({
 *   siteId: '123-xyz',
 *   apiKey: '9876543'
 * })
 */
export default function customerIOPlugin(pluginConfig = {}) {
  // Allow for userland overides of base methods
  const cioConfig = {
    ...config,
    ...pluginConfig
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
