/* global ga */

/**
 * Google analytics plugin
 * @link https://getanalytics.io/plugins/google-analytics/
 * @link https://analytics.google.com/analytics/web/
 * @link https://developers.google.com/analytics/devguides/collection/analyticsjs
 * @param {object} pluginConfig - Plugin settings
 * @param {string} pluginConfig.trackingId - site tracking Id
 * @return {*}
 * @example
 *
 * googleAnalytics({
 *   trackingId: '123-xyz'
 * })
 */
function googleAnalytics(pluginConfig = {}) {
  // Allow for userland overides of base methods
  return {
    NAMESPACE: 'google-analytics',
    config: pluginConfig,
    initialize: initialize,
    // Google Analytics page view
    page: ({ payload, config }) => {
      const { properties } = payload
      pageView(properties.path)
    },
    // Google Analytics track event
    track: ({ payload, config, instance }) => {
      const { properties, event } = payload
      const { label, value, category, nonInteraction } = properties
      const campaign = instance.getState('context.campaign')
      trackEvent({
        hitType: 'event',
        event: event,
        label: label,
        category: category || 'All',
        value: value,
        nonInteraction,
        campaign: campaign
      })
    },
    identify: ({ payload, config }) => {
      identifyVisitor(payload.userId)
      /* Todo implement custom dimensions
        http://bit.ly/2yULdOO & http://bit.ly/2NS5nOE
      // user mapping required
      ga('set', {
        'dimensionX': valueX,
        'dimensionY': valueY,
        'dimensionZ': valueZ
      })
      */
    },
    loaded: () => {
      return !!window.gaplugins
    }
  }
}

export default googleAnalytics

function gaNotLoaded() {
  return typeof ga === 'undefined'
}

export function initialize({ config }) {
  if (!config.trackingId) throw new Error('No google analytics trackingId defined')
  if (gaNotLoaded()) {
    /* eslint-disable */
    (function(i, s, o, g, r, a, m) {
      i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function() {
        (i[r].q = i[r].q || []).push(arguments)
      }, i[r].l = 1 * new Date(); a = s.createElement(o),
      m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
    })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga')
    /* eslint-enable */
    ga('create', config.trackingId, 'auto')

    if (config.debug) {
      // Disable sends to GA http://bit.ly/2Ro0vTR
      ga('set', 'sendHitTask', null)
      window.ga_debug = { trace: true }
    }
  }
}

/**
 * Send page view to google analytics
 * @param  {string} [urlPath = location.pathname] - path of current path
 */
export function pageView(urlPath) {
  if (gaNotLoaded()) return
  const path = urlPath || document.location.pathname
  ga('set', 'page', path)
  ga('send', 'pageview')
}

/**
 * Send event tracking to Google Analytics
 * @param  {object} eventData - GA event payload
 * @param  {string} [eventData.hitType = 'event'] - hitType https://bit.ly/2Jab9L1 one of 'pageview', 'screenview', 'event', 'transaction', 'item', 'social', 'exception', 'timing'
 * @param  {string} [eventData.event] - event Action https://bit.ly/2CUzeoz
 * @param  {string} [eventData.label] - event Label http://bit.ly/2oo8eb3
 * @param  {string} [eventData.category] - event Category http://bit.ly/2EAy9UP
 * @param  {string} [eventData.nonInteraction = false] - nonInteraction https://bit.ly/2CUzeoz
 * @return {object} sent data
 */
export function trackEvent(eventData) {
  if (gaNotLoaded()) return

  const data = {
    // hitType https://bit.ly/2Jab9L1 one of 'pageview', 'screenview', 'event', 'transaction', 'item', 'social', 'exception', 'timing'
    hitType: eventData.hitType || 'event',
    // eventAction https://bit.ly/2CUzeoz
    eventAction: eventData.event,
    // eventLabel http://bit.ly/2oo8eb3
    eventLabel: eventData.label,
    // eventCategory http://bit.ly/2EAy9UP
    eventCategory: eventData.category || 'All',
    // nonInteraction https://bit.ly/2CUzeoz
    nonInteraction: (eventData.nonInteraction !== undefined) ? !!eventData.nonInteraction : false
  }

  if (eventData.value) {
    // how much is this action worth?
    data.eventValue = format(eventData.value)
  }

  /* Attach campaign data */
  const campaignData = eventData.campaign || {}
  const { name, source, medium, content, keyword } = campaignData
  if (name) data.campaignName = name
  if (source) data.campaignSource = source
  if (medium) data.campaignMedium = medium
  if (content) data.campaignContent = content
  if (keyword) data.campaignKeyword = keyword

  /* Send data to Google Analytics */
  ga('send', 'event', data)
  return data
}

/**
 * Identify a visitor by Id
 * @param  {string} id - unique visitor ID
 */
export function identifyVisitor(id) {
  if (gaNotLoaded()) return
  if (id) ga('set', 'userId', id)
}

function format(value) {
  if (!value || value < 0) return 0
  return Math.round(value)
}
