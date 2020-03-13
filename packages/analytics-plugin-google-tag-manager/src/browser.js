/* global dataLayer */

export const config = {
  debug: false,
  containerId: null,
  // assumesPageview: true,
}

/**
 * Google tag manager plugin
 * @link https://getanalytics.io/plugins/google-tag-manager
 * @link https://developers.google.com/tag-manager/
 * @param {object} pluginConfig - Plugin settings
 * @param {string} pluginConfig.containerId - The Container ID uniquely identifies the GTM Container.
 * @return {object} Analytics plugin
 * @example
 *
 * googleTagManager({
 *   containerId: 'GTM-123xyz'
 * })
 */
function googleTagManager(pluginConfig = {}) {
  // Allow for userland overides of base methods
  return {
    name: 'google-tag-manager',
    config: {
      ...config,
      ...pluginConfig
    },
    initialize: ({ config }) => {
      const { containerId } = config
      if (!containerId) {
        throw new Error('No google tag manager containerId defined')
      }
      if (!scriptLoaded(containerId)) {
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
    track: ({ payload, options, config }) => {
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
        if (config.debug) {
          console.log('gtag push', {
            event: payload.event,
            ...formattedPayload
          })
        }
        dataLayer.push({
          event: payload.event,
          ...formattedPayload
        })
      }
    },
    loaded: () => {
      const hasDataLayer = !!(window.dataLayer && Array.prototype.push !== window.dataLayer.push)
      return scriptLoaded(pluginConfig.containerId) && hasDataLayer
    },
  }
}

export default googleTagManager

const regexCache = {}

/*
TODO add logic to make it impossible to load 2 plugins with the same container ID
[containerID]: pluginName
*/

function scriptLoaded(containerId) {
  let regex = regexCache[containerId]
  if (!regex) {
    regex = new RegExp('googletagmanager\\.com\\/gtm\\.js.*[?&]id=' + containerId)
    regexCache[containerId] = regex
  }
  const scripts = document.querySelectorAll('script[src]')
  return !!Object.keys(scripts).filter((key) => (scripts[key].src || '').match(regex)).length
}
