/**
 * GA analytics integration
 * https://developers.google.com/analytics/devguides/collection/analyticsjs
 */

/* global ga */

export const NAMESPACE = 'google'
const inBrowser = typeof window !== 'undefined'

export const config = {
  assumesPageview: true
}

/* initialize GA script */
export const initialize = (config) => {
  if (!config.trackingId) {
    throw new Error('No google tracking id defined')
  }
  if (inBrowser) {
    console.log('initialize GA')
  }
  if (typeof window !== 'undefined' && typeof ga === 'undefined') {
    (function(i, s, o, g, r, a, m) {
      i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function() {
        (i[r].q = i[r].q || []).push(arguments)
      }, i[r].l = 1 * new Date(); a = s.createElement(o),
      m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
    })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga')

    ga('create', config.trackingId, 'auto')
    // TODO use assumesPageview option
    if (config.assumesPageview) {
      ga('send', 'pageview')
    }
  }
}

/* Trigger GA page view */
export const page = (pageData) => {
  if (typeof ga !== 'undefined') {
    if (inBrowser) {
      console.info(`GA Pageview > ${window.location.href}`)
    }
    ga('set', 'page', pageData.path) // eslint-disable-line
    ga('send', 'pageview') // eslint-disable-line
  }
}

/* Google Analytics Track call */
export const track = (event, payload = {}, analytics) => {
  const gaData = {
    // hitType https://bit.ly/2Jab9L1
    hitType: 'event', // 'pageview', 'screenview', 'event', 'transaction', 'item', 'social', 'exception', 'timing'
    // eventAction https://bit.ly/2CUzeoz
    eventAction: event,
    // eventCategory http://bit.ly/2EAy9UP
    eventCategory: payload.category || 'All',
    // nonInteraction https://bit.ly/2CUzeoz
    nonInteraction: (payload.nonInteraction !== undefined) ? !!payload.nonInteraction : false
  }

  if (inBrowser) {
    console.log(`GOOGLE Event > [${event}] [payload: ${JSON.stringify(payload, null, 2)}]`)
    const debugLabel = (payload.label) ? ` [Label: ${payload.label}]` : ''
    const debugValue = (payload.value) ? ` [Value: ${payload.value}]` : ''
    const debugInteraction = (payload.nonInteraction) ? ` [nonInteraction: ${payload.nonInteraction}]` : ''
    const debugCat = (gaData.eventCategory) ? ` [Category: ${gaData.eventCategory}]` : ''
    let debugGA = `GA Event > ${debugCat} [Action: ${event}]${debugLabel}${debugValue}${debugInteraction}`
    console.log(debugGA)
  }
  // return Promise.resolve()
  if (typeof ga !== 'undefined') {
    if (payload.label) {
      // what form is this? If this is part of an A/B test, what variation?
      gaData.eventLabel = payload.label
    }
    if (payload.value) {
      // how much is this action worth?
      gaData.eventValue = payload.value
    }
    /*
    if (campaign.name) payload.campaignName = campaign.name;
    if (campaign.source) payload.campaignSource = campaign.source;
    if (campaign.medium) payload.campaignMedium = campaign.medium;
    if (campaign.content) payload.campaignContent = campaign.content;
    if (campaign.term) payload.campaignKeyword = campaign.term;

    var payload = {
     eventAction: track.event(),
     eventCategory: track.category() || this._category || 'All',
     eventLabel: props.label,
     eventValue: formatValue(props.value || track.revenue()),
     // Allow users to override their nonInteraction integration setting for any single particluar event.
     nonInteraction: props.nonInteraction !== undefined ? !!props.nonInteraction : !!opts.nonInteraction
    };
    */
    console.log(`GA Payload Event > [${JSON.stringify(gaData, null, 2)}]`)
    ga('send', 'event', gaData)
  }
}

/* Identify GA user */
/* Google Analytics Track call */
export const identify = (id, traits, opts, cb) => {
  if (inBrowser) {
    console.log('GA identify', id, traits, opts)
  }

  if (id && typeof ga !== 'undefined') {
    ga('set', 'userId', id)
  }
  // Todo implement custom dimensions
  /* http://bit.ly/2yULdOO & http://bit.ly/2NS5nOE
  // mapping required
  ga('set', {'dimensionX': valueX, 'dimensionY': valueY, 'dimensionZ': valueZ});
  */
}

export const loaded = function() {
  if (!inBrowser) {
    return true
  }
  return !!window.gaplugins
}

/* export the integration */
module.exports = function googleAnalytics(userConfig) {
  const mergedConfig = {
    ...config, // hardcoded defaults
    ...userConfig
  }
  return {
    NAMESPACE: NAMESPACE,
    config: mergedConfig,
    initialize: extend('initialize', initialize, mergedConfig),
    page: extend('page', page, mergedConfig),
    track: extend('track', track, mergedConfig),
    identify: extend('identify', identify, mergedConfig),
    loaded: extend('loaded', loaded, mergedConfig)
  }
}

// Allows for userland overrides of base functions
function extend(methodName, defaultFunction, config) {
  if (config[methodName] && typeof config[methodName] === 'function') {
    return config[methodName]
  }
  return defaultFunction
}
