/**
 * Google tag manager plugin
 * https://developers.google.com/tag-manager/devguide
 */

/* global dataLayer */

// Analytics Integration Configuration
export const config = {
  assumesPageview: true
}

export default function googleTagManager(userConfig) {
  // Allow for userland overides of base methods
  return {
    NAMESPACE: 'google-tag-manager',
    config: Object.assign({}, config, userConfig),
    initialize: ({ config }) => {
      const { containerId } = config
      if (!containerId) {
        throw new Error('No google tag manager containerId defined')
      }
      if (typeof dataLayer === 'undefined') {
        /* eslint-disable */
        (function(w, d, s, l, i) {
          w[l] = w[l] || [];
          w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
          var f = d.getElementsByTagName(s)[0], j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : '';
          j.async = true;
          j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
          f.parentNode.insertBefore(j, f);
        })(window, document, 'script', 'dataLayer', containerId);
        /* eslint-enable */
      }
    },
    page: ({ payload, options, instance }) => {
      if (typeof dataLayer !== 'undefined') {
        dataLayer.push(payload.properties)
      }
    },
    track: ({ payload, options }) => {
      if (typeof dataLayer !== 'undefined') {
        const { anonymousId, userId, properties, category } = payload
        const formattedPayload = properties
        if (userId) {
          formattedPayload.userId = userId
        }
        if (anonymousId) {
          formattedPayload.anonymousId = anonymousId
        }
        if (!category) {
          formattedPayload.category = 'All'
        }
        console.log('gtag push', {
          event: payload.event,
          ...formattedPayload
        })
        dataLayer.push({
          event: payload.event,
          ...formattedPayload
        })
      }
    },
    loaded: () => {
      return !!(window.dataLayer && Array.prototype.push !== window.dataLayer.push)
    },
  }
}
