
let universalAnalytics
if (!process.browser) {
  universalAnalytics = require('universal-analytics')
}

/**
 * Serverside Google Analytics plugin
 * @param {object} pluginConfig - Plugin settings
 * @param {string} pluginConfig.trackingId - Google Analytics site tracking Id. Same as tid (se below), only one needed
 * @param {string} pluginConfig.tid - Google Analytics site tracking Id. Same as trackingId (se above), only one needed
 * @param {string} [pluginConfig.cid] - Google Analytics client Id. It generates a random UUID if none is set
 * @param {boolean} [pluginConfig.strictCidFormat] - Set it to false to set a custom client Id (not UUID). Only used if cid is set
 * @param {string} [pluginConfig.uid] - Google Analytics user Id
 * @return {*}
 * @example
 *
 * googleAnalytics({
 *   trackingId: '123-xyz',
 *   cid: '123456789.987654321',
 *   strictCidFormat: false
 * })
 *
 * googleAnalytics({
 *   tid: '123-xyz',
 *   cid: '123456789.987654321',
 *   strictCidFormat: false
 * })
 */
function googleAnalytics(pluginConfig = {}) {
  const client = initialize(pluginConfig)
  return {
    name: 'google-analytics',
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
  if (!config.trackingId && !config.tid) throw new Error('No google analytics trackingId defined')
  if (!config.tid) config.tid = config.trackingId
  return universalAnalytics(config)
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
