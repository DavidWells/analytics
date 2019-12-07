/* eslint-disable no-underscore-dangle */
/* global _gs */

/**
 * GoSquared analytics integration
 * @link https://www.gosquared.com/docs/api/javascript-tracking-code/
 * @param {object} pluginConfig - Plugin settings
 * @param {string} pluginConfig.projectToken - GoSquared project token for client side tracking
 * @param {boolean} [pluginConfig.disableAnonymousTraffic] -  Disable anonymous events from firing
 * @return {object} Analytics plugin
 * @example
 *
 * goSquaredPlugin({
 *   projectToken: 'GSN-123456-A'
 * })
 */

function goSquaredPlugin(pluginConfig = {}) {
  return {
    NAMESPACE: 'gosquared',
    config: pluginConfig,
    initialize: ({ config }) => {
      const { debug, projectToken } = config
      if (!projectToken) {
        throw new Error('No GoSquared projectToken defined')
      }
      if (typeof _gs === 'undefined') {
        (function initialize(g, s, q, r, d) {
          r = g[r] =
            g[r] ||
            function pushArgs() {
              (r.q = r.q || []).push(arguments)
            }
          d = s.createElement(q)
          q = s.getElementsByTagName(q)[0]
          d.src = '//d1l6p2sc9645hc.cloudfront.net/tracker.js'
          q.parentNode.insertBefore(d, q)
        }(window, document, 'script', '_gs'))
        // Settings https://www.gosquared.com/docs/api/javascript-tracking-code/configuration/
        _gs('set', 'trackLocal', debug)
        _gs(projectToken)
      }
    },
    page: ({ payload, config }) => {
      if (config.disableAnonymousTraffic && !payload.userId) return

      if (typeof _gs !== 'undefined') {
        _gs('track', document.location.href, payload.title)
      }
    },
    reset: ({ instance }) => {
      /* Clear gosquared cookies on reset */
      const { storage } = instance
      const opts = { storage: 'cookie' }
      storage.removeItem('_gs', opts)
      storage.removeItem('_gsid', opts)
      _gs('unidentify')
    },
    track: ({ payload, config }) => {
      if (config.disableAnonymousTraffic && !payload.userId) return

      if (typeof _gs !== 'undefined') {
        _gs('event', payload.event, payload.properties)
      }
    },
    identify: ({ payload }) => {
      const { userId: email, traits: custom } = payload
      if (typeof _gs !== 'undefined' && email) {
        _gs('identify', {
          email,
          name: `${custom.first_name} ${custom.last_name}`,
          custom,
        })
      }
    },
    loaded: () => !!(window._gs && window._gs.push !== Array.prototype.push),
  }
}

export default goSquaredPlugin
