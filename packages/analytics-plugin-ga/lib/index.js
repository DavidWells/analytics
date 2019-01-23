/**
 * GA analytics plugin
 * https://developers.google.com/analytics/devguides/collection/analyticsjs
 */

/* global ga */
const inBrowser = typeof window !== 'undefined'

// Analytics Integration Configuration
export const config = {
  assumesPageview: true
}

/* Export the integration */
export default function googleAnalytics(userConfig) {
  // Allow for userland overides of base methods
  return {
    NAMESPACE: 'google-analytics',
    config: Object.assign({}, config, userConfig),
    initialize: ({ config }) => {
      if (!config.trackingId) {
        throw new Error('No google tracking id defined')
      }
      if (inBrowser && typeof ga === 'undefined') {
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

        // TODO use assumesPageview option
        if (config.assumesPageview) {
          ga('send', 'pageview')
        }
      }
    },
    // Google Analytics page view
    page: ({ payload, config }) => {
      const { properties } = payload
      if (config.debug) {
        console.log(`google analytics pageview > [payload: ${JSON.stringify(payload, null, 2)}]`)
      }
      if (inBrowser && typeof ga !== 'undefined') {
        ga('set', 'page', properties.path) // eslint-disable-line
        ga('send', 'pageview') // eslint-disable-line
      }
    },
    // Google Analytics track event
    track: ({ payload, config }) => {
      const { event, label, value, category, nonInteraction } = payload
      const gaData = {
        // hitType https://bit.ly/2Jab9L1
        hitType: 'event', // 'pageview', 'screenview', 'event', 'transaction', 'item', 'social', 'exception', 'timing'
        // eventAction https://bit.ly/2CUzeoz
        eventAction: event,
        // eventCategory http://bit.ly/2EAy9UP
        eventCategory: category || 'All',
        // nonInteraction https://bit.ly/2CUzeoz
        nonInteraction: (payload.nonInteraction !== undefined) ? !!payload.nonInteraction : false
      }

      if (config.debug) {
        console.log(`GOOGLE Event > [${event}] [payload: ${JSON.stringify(payload, null, 2)}]`)
        const debugLabel = (label) ? ` [Label: ${label}]` : ''
        const debugValue = (value) ? ` [Value: ${value}]` : ''
        const debugInteraction = (payload.nonInteraction) ? ` [nonInteraction: ${nonInteraction}]` : ''
        const debugCat = (gaData.eventCategory) ? ` [Category: ${gaData.eventCategory}]` : ''
        let debugGA = `GA Event > ${debugCat} [Action: ${event}]${debugLabel}${debugValue}${debugInteraction}`
        console.log(debugGA)
      }

      if (typeof ga !== 'undefined') {
        if (label) {
          // what form is this? If this is part of an A/B test, what variation?
          gaData.eventLabel = payload.label
        }
        if (value) {
          // how much is this action worth?
          gaData.eventValue = payload.value
        }
        /* Todo attach campaign data from context
        if (campaign.name) payload.campaignName = campaign.name;
        if (campaign.source) payload.campaignSource = campaign.source;
        if (campaign.medium) payload.campaignMedium = campaign.medium;
        if (campaign.content) payload.campaignContent = campaign.content;
        if (campaign.term) payload.campaignKeyword = campaign.term;

        const payload = {
          eventAction: track.event(),
          eventCategory: track.category() || this._category || 'All',
          eventLabel: props.label,
          eventValue: formatValue(props.value || track.revenue()),
          // Allow users to override their nonInteraction integration setting for any single particluar event.
          nonInteraction: props.nonInteraction !== undefined ? !!props.nonInteraction : !!opts.nonInteraction
        }
        */
        // console.log(`GA Payload Event > [${JSON.stringify(gaData, null, 2)}]`)
        ga('send', 'event', gaData)
      }
    },
    identify: ({ payload }) => {
      const { userId } = payload
      if (config.debug) {
        console.log(`google analytics identify > [payload: ${JSON.stringify(payload, null, 2)}]`)
      }
      if (inBrowser && typeof ga !== 'undefined' && userId) {
        ga('set', 'userId', userId)
      }
      /* Todo implement custom dimensions http://bit.ly/2yULdOO & http://bit.ly/2NS5nOE
      // user mapping required
      ga('set', {'dimensionX': valueX, 'dimensionY': valueY, 'dimensionZ': valueZ});
      */
    },
    loaded: function() {
      if (!inBrowser) return true
      return !!window.gaplugins
    },
    ready: () => {
      alert('GA ready')
    }
  }
}
