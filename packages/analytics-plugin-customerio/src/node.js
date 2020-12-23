/* import serverside SDK */
let CustomerIO
if (!process.browser) {
  CustomerIO = require('customerio-node')
}

/**
 * Customer.io analytics server side integration. Uses https://github.com/customerio/customerio-node
 * @link https://getanalytics.io/plugins/customerio/
 * @link https://customer.io/docs/api/
 * @param {object} pluginConfig - Plugin settings
 * @param {string} pluginConfig.siteId - Customer.io site Id for server side tracking
 * @param {string} pluginConfig.apiKey - Customer.io API key for server side tracking
 * @return {object} Analytics plugin
 *
 * @example
 *
 * customerIOServer({
 *   siteId: '123-xyz',
 *   apiKey: '9876543'
 * })
 */
function customerIOServer(pluginConfig = {}) {
  // Allow for userland overides of base methods
  if (!pluginConfig.siteId) {
    throw new Error('customer.io siteId missing')
  }
  if (!pluginConfig.apiKey) {
    throw new Error('customer.io apiKey missing')
  }
  const client = new CustomerIO(pluginConfig.siteId, pluginConfig.apiKey)
  return {
    name: 'customerio',
    config: pluginConfig,
    // page view
    page: ({ payload }) => {
      const { userId, properties } = payload
      if (!userId) return false

      client.trackPageView(userId, properties.url)
    },
    // track event
    track: ({ payload }) => {
      const { userId, event, properties } = payload
      if (!userId) return false

      client.track(userId, {
        name: event,
        data: properties
      })
    },
    // identify user
    identify: ({ payload }) => {
      const { userId, traits } = payload
      client.identify(userId, traits)
    }
  }
}

export default customerIOServer
