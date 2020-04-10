/* global ga */

const config = {
  /* Website's Google Analytics Tracking ID */
  trackingId: null,
  /* Turn on google analytics debugging */
  debug: false,
  /* Anonymizing IP addresses sent to Google Analytics https://bit.ly/3c660Rd */
  anonymizeIp: false,
  /* Custom dimensions allow you to send extra information to Google Analytics. https://bit.ly/3c5de88 */
  customDimensions: {},
  /* Reset custom dimensions by key on analytics.page calls. Useful for single page apps */
  resetCustomDimensionsOnPage: [],
  /* Mapped dimensions will be set to the page & sent as properties of all subsequent events on that page.
     If false, analytics will only pass custom dimensions as part of individual events
  */
  setCustomDimensionsToPage: true,
  /* Custom metrics https://bit.ly/3c5de88 */
  // TODO customMetrics: { key: 'metric1' }
  /* Content groupings https://bit.ly/39Zt3Me */
  // TODO contentGroupings: { key: 'contentGroup1' }
}

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
  let pageCalledOnce = false
  // Allow for userland overides of base methods
  return {
    NAMESPACE: 'google-analytics',
    config: {
      ...config,
      ...pluginConfig
    },
    initialize: initialize,
    // Google Analytics page view
    page: ({ payload, config, instance }) => {
      const { properties } = payload
      const { resetCustomDimensionsOnPage, customDimensions } = config
      const campaign = instance.getState('context.campaign')
      if (gaNotLoaded()) return

      /* If dimensions are specifiied to reset, clear them before page view */
      if (resetCustomDimensionsOnPage && resetCustomDimensionsOnPage.length) {
        const resetDimensions = resetCustomDimensionsOnPage.reduce((acc, key) => {
          if (customDimensions[key]) {
            acc[customDimensions[key]] = null // { dimension1: null } etc
          }
          return acc
        }, {})
        if (Object.keys(resetDimensions).length) {
          // Reset custom dimenions
          ga('set', resetDimensions)
        }
      }

      const path = properties.path || document.location.pathname

      const pageView = {
        page: path,
        title: properties.title,
        location: properties.url
      }

      let pageData = {
        page: path,
        title: properties.title
      }
      // allow referrer override if referrer was manually set
      if (properties.referrer !== document.referrer) {
        pageData.referrer = properties.referrer
      }

      const campaignData = addCampaignData(campaign)

      const dimensions = setCustomDimenions(properties, config)

      /* Dimensions will only be included in the event if config.setCustomDimensionsToPage is false */
      const finalPayload = {
        ...pageView,
        ...campaignData,
        ...dimensions
      }

      ga('set', pageData)

      // Remove location for SPA tracking after initial page view
      if (pageCalledOnce) {
        delete finalPayload.location
      }

      /* send page view to GA */
      ga('send', 'pageview', finalPayload)

      // Set after initial page view
      pageCalledOnce = true
    },
    /**
     * Google Analytics track event
     * @example
     *
     * analytics.track('playedVideo', {
     *   category: 'Videos',
     *   label: 'Fall Campaign',
     *   value: 42
     * })
     */
    track: ({ payload, config, instance }) => {
      const { properties, event } = payload
      const { label, value, category, nonInteraction } = properties
      const campaign = instance.getState('context.campaign')
      // TODO inline this trackEvent
      trackEvent({
        hitType: 'event',
        event: event,
        label: label,
        category: category || 'All',
        value: value,
        nonInteraction,
        campaign: campaign
      }, config, payload)
    },
    identify: ({ payload, config }) => {
      identifyVisitor(payload.userId, payload.traits, config)
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

export function initialize(pluginApi) {
  const { config, instance } = pluginApi
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

    if (config.anonymizeIp) {
      ga('set', 'anonymizeIp', true)
    }

    /* set custom dimenions from user traits */
    const user = instance.user() || {}
    const traits = user.traits || {}
    if (Object.keys(traits).length) {
      const customDimensions = formatObjectIntoDimensions(traits, config)
      ga('set', customDimensions)
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
export function trackEvent(eventData, opts = {}, payload) {
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
  const campaignData = addCampaignData(eventData)
  /* Set Dimensions or return them for payload is config.setCustomDimensionsToPage is false */
  const dimensions = setCustomDimenions(payload.properties, opts)

  const finalPayload = {
    ...data,
    /* Attach campaign data, if exists */
    ...campaignData,
    /* Dimensions will only be included in the event if config.setCustomDimensionsToPage is false */
    ...dimensions
  }

  /* Send data to Google Analytics */
  ga('send', 'event', finalPayload)
  return finalPayload
}

/**
 * Add campaign data to GA payload https://bit.ly/34qFCPn
 * @param {Object} [campaignData={}] [description]
 * @param {String} [campaignData.campaignName] - Name of campaign
 * @param {String} [campaignData.campaignSource] - Source of campaign
 * @param {String} [campaignData.campaignMedium] - Medium of campaign
 * @param {String} [campaignData.campaignContent] - Content of campaign
 * @param {String} [campaignData.campaignKeyword] - Keyword of campaign
 */
function addCampaignData(campaignData = {}) {
  let campaign = {}
  const { name, source, medium, content, keyword } = campaignData
  if (name) campaign.campaignName = name
  if (source) campaign.campaignSource = source
  if (medium) campaign.campaignMedium = medium
  if (content) campaign.campaignContent = content
  if (keyword) campaign.campaignKeyword = keyword
  return campaign
}

/* Todo add includeSearch options ¯\_(ツ)_/¯
function getPagePath(props, opts = {}) {
  if (!props) return
  if (opts.includeSearch && props.search) {
    return `${props.path}${props.search}`
  }
  return props.path
}
*/

// properties, data=opts
function formatObjectIntoDimensions(properties, opts = {}) {
  const { customDimensions } = opts
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
      acc[dimensionKey] = value
      return acc
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

function setCustomDimenions(props = {}, opts) {
  const customDimensions = formatObjectIntoDimensions(props, opts)
  if (!Object.keys(customDimensions).length) {
    return {}
  }
  // If setCustomDimensionsToPage false, don't save custom dimenions from event to page
  if (!opts.setCustomDimensionsToPage) {
    return customDimensions
  }
  // Set custom dimensions
  ga('set', customDimensions)
  return {}
}

/**
 * Identify a visitor by Id
 * @param  {string} id - unique visitor ID
 */
export function identifyVisitor(id, traits = {}, conf = {}) {
  if (gaNotLoaded()) return
  if (id) ga('set', 'userId', id)
  if (Object.keys(traits).length) {
    const custom = formatObjectIntoDimensions(traits, conf)
    ga('set', custom)
  }
}

function format(value) {
  if (!value || value < 0) return 0
  return Math.round(value)
}
