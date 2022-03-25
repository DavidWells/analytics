
// In this file, we're wrapping universal-analytics so we can send
// googleAnalytics events from a node server environment.

// This allows us to convert the analytics custom dimension syntax
// into the one we need for universal-analytics.

// analytics uses {customDimension[N]: <value>}
// while universal-analytics uses {cd[N]: <value>}
let univeralAnalyticsRosettaStone= {
  dimension1:"cd1",
  dimension2:"cd2",
  dimension3:"cd3",
  dimension4:"cd4",
  dimension5:"cd5",
  dimension6:"cd6",
  dimension7:"cd7",
  dimension8:"cd8",
  dimension9:"cd9",
  dimension10:"cd10",
  dimension11:"cd11",
  dimension12:"cd12",
  dimension13:"cd13",
  dimension14:"cd14",
  dimension15:"cd15",
  dimension16:"cd16",
  dimension17:"cd17",
  dimension18:"cd18",
  dimension19:"cd19",
  dimension20:"cd20"
}

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
  var customDimensions = pluginConfig.customDimensions || {};
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
      }, client, customDimensions)
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

export function trackEvent({ category, event, label, value, properties }, client, customDimensions) {
  // Prepare Custom Dimensions to be Reported.
  var dimensions = formatObjectIntoDimensions(properties, customDimensions);

  // Send Event.
  client.event(category, event, label, value, dimensions).send()
}

/**
 * Identify a visitor by Id
 * @param  {string} id - unique visitor ID
 * @param  {object} client - initialized GA client
 */
export function identifyVisitor(id, client) {
  client.set('uid', id)
}

// Prep Custom Dimensions to be Reported.
function formatObjectIntoDimensions(properties, opts) {
  var customDimensions = opts;

  // TODO map opts.customMetrics; Object.keys(customMetrics) { key: 'metric1' }
  // TODO map opts.contentGroupings; Object.keys(contentGroupings) { key: 'contentGroup1' }

  /* Map values from payload to any defined custom dimensions */
  return Object.keys(customDimensions).reduce((acc, key) => {
    const dimensionKey = customDimensions[key]
    var value = get(properties, key) || properties[key]
    if (typeof value === 'boolean') {
      value = value.toString()
    }
    if (value || value === 0) {
      if(univeralAnalyticsRosettaStone[dimensionKey]){
        acc[univeralAnalyticsRosettaStone[dimensionKey]] = value
        return acc
      }
      else{
        throw new Error('Invalid custom dimension. Should be "dimension[n]" where [n] is an integer inclusively between 1-20.')
      }
    }
    return acc
  }, {})
}

function get(obj, key, def, p, undef) {
  key = key.split ? key.split('.') : key
  for (p = 0; p < key.length; p++) {
    obj = obj ? obj[key[p]] : undef
  }
  return obj === undef ? def : obj
}
