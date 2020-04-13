
let universalAnalytics
if (!process.browser) {
  universalAnalytics = require('universal-analytics')
}

/**
 * Serverside Google Analytics plugin
 * @param {object} pluginConfig - Plugin settings
 * @param {string} pluginConfig.trackingId - Google Analytics site tracking Id
 * @return {*}
 * @example
 *
 * googleAnalytics({
 *   trackingId: '123-xyz'
 * })
 */
function googleAnalytics(pluginConfig = {}) {
  const client = initialize(pluginConfig)
  return {
    NAMESPACE: 'google-analytics',
    config: pluginConfig,
    // page view
    page: ({ payload, config }) => {
      const { properties } = payload
      const { path, href, title } = properties
      pageView({ path, href, title }, client)
    },
    // track event
    track: ({ payload, config }) => {
      const { event, properties } = payload
      const category = properties.category || 'All'
      const label = properties.label || 'NA'
      const value = properties.value
      trackEvent({
        category,
        event,
        label,
        value,
        properties
      }, client)
    },
    /* identify user */
    identify: ({ payload }) => identifyVisitor(payload.userId, client)
  }
}

export default googleAnalytics

export function initialize(config) {
  if (!config.trackingId) throw new Error('No google analytics trackingId defined')
  return universalAnalytics(config.trackingId)
}

export function pageView({ path, href, title }, client) {
  if (!path || !href || !title) {
    throw new Error('Missing path, href or title in page call for GA')
  }
  client.pageview(path, href, title).send()
}

export function trackEvent({ category, event, label, value, properties }, client) {
  // Todo map properties to custom dimensions
  client.event(category, event, label, value).send()
}

/**
 * Identify a visitor by Id
 * @param  {string} id - unique visitor ID
 * @param  {object} client - initialized GA client
 */
export function identifyVisitor(id, client) {
  client.set('uid', id)
}
