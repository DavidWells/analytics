/* global _cio */

/**
 * Customer.io analytics integration
 * @link https://getanalytics.io/plugins/customerio/
 * @link https://customer.io/docs/javascript-quick-start
 * @param {object} pluginConfig - Plugin settings
 * @param {string} pluginConfig.siteId - Customer.io site Id for client side tracking
 * @param {boolean} [pluginConfig.disableAnonymousTraffic] -  Disable anonymous events from firing
 * @return {object} Analytics plugin
 * @example
 *
 * customerIOPlugin({
 *   siteId: '123-xyz'
 * })
 */
function customerIOPlugin(pluginConfig = {}) {
  // Because customer.io automatically fired a page view onLoad
  // We need to ignore the first .page() call
  let initialPageViewFired = false
  return {
    name: 'customerio',
    config: pluginConfig,
    initialize: ({ config }) => {
      const { siteId } = config
      if (!siteId) {
        throw new Error('No customer.io siteId defined')
      }
      if (typeof _cio === 'undefined') {
        window._cio = [];
        (function() {
          var a, b, c
          a = function(f) {
            return function() {
              _cio.push([f].concat(Array.prototype.slice.call(arguments, 0)))
            }
          }
          b = ['load', 'identify', 'sidentify', 'track', 'page']
          for (c = 0; c < b.length; c++) { _cio[b[c]] = a(b[c]) }
          var t = document.createElement('script')
          var s = document.getElementsByTagName('script')[0]
          t.async = true
          t.id = 'cio-tracker'
          t.setAttribute('data-site-id', siteId)
          t.src = 'https://assets.customer.io/assets/track.js'
          s.parentNode.insertBefore(t, s)
        })()
      }
    },
    page: ({ payload, config }) => {
      if (config.disableAnonymousTraffic && !payload.userId) return
      /* ignore the first .page() call b/c customer.io already fired it */
      if (!initialPageViewFired) {
        initialPageViewFired = true
        return
      }

      if (typeof _cio !== 'undefined') {
        _cio.page(document.location.href, payload.properties)
      }
    },
    reset: ({ instance }) => {
      /* Clear customer.io cookies on reset */
      const { storage } = instance
      const opts = { storage: 'cookie' }
      storage.removeItem('_cio', opts)
      storage.removeItem('_cioid', opts)
    },
    track: ({ payload, config }) => {
      if (config.disableAnonymousTraffic && !payload.userId) return

      if (typeof _cio !== 'undefined') {
        _cio.track(payload.event, payload.properties)
      }
    },
    identify: ({ payload }) => {
      const { userId, traits } = payload
      if (typeof _cio !== 'undefined' && userId) {
        _cio.identify({
          id: userId,
          ...traits
        })
      }
    },
    loaded: () => {
      return !!(window._cio && window._cio.push !== Array.prototype.push)
    }
  }
}

export default customerIOPlugin
