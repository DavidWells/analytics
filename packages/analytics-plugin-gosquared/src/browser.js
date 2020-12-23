/* eslint-disable no-underscore-dangle */
/* global _gs */

const config = {
  /* Your GoSquared project token */
  projectToken: null,
  /* Disable anonymous MTU */
  disableAnonymousTraffic: false,
  /* Setting this value to true will prevent the visitors' IP address from being tracked */
  anonymizeIP: false,
  /* Override default cookie domain for subdomain tracking */
  cookieDomain: null,
  /* Set to false to disable usage of cookies in the tracker */
  useCookies: true,
  /* Whether to track hashes in the page URL */
  trackHash: false,
  /* Whether to track URL querystring parameters */
  trackParams: true,
  /* Enable tracking on localhost */
  trackLocal: false
}

/**
 * GoSquared analytics integration
 * @link https://www.gosquared.com/docs/api/javascript-tracking-code/
 * @param {object} pluginConfig - Plugin settings
 * @param {string} pluginConfig.projectToken - GoSquared project token for client side tracking
 * @param {boolean} [pluginConfig.disableAnonymousTraffic] -  Disable anonymous events from firing
 * @param {boolean} [pluginConfig.trackLocal] - Enable tracking on localhost
 * @param {boolean} [pluginConfig.anonymizeIP] - Prevent the visitors' IP address from being tracked
 * @param {string}  [pluginConfig.cookieDomain] - Override default cookie domain for subdomain tracking
 * @param {boolean} [pluginConfig.useCookies] - Set to false to disable usage of cookies in the tracker
 * @param {boolean} [pluginConfig.trackHash] - Whether to track hashes in the page URL
 * @param {boolean} [pluginConfig.trackParams] - Whether to track URL querystring parameters
 * @return {object} Analytics plugin
 * @example
 *
 * goSquaredPlugin({
 *   projectToken: 'GSN-123456-A'
 * })
 */
function goSquaredPlugin(pluginConfig = {}) {
  return {
    name: 'gosquared',
    config: pluginConfig,
    config: {
      ...config,
      ...pluginConfig
    },
    initialize: ({ config }) => {
      const { projectToken, referrer, cookieDomain } = config
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

        // initialize with token
        _gs(projectToken)
        // Set GoSquared library settings
        _gs('set', 'anonymizeIP', config.anonymizeIP)
        if (cookieDomain) _gs('set', 'cookieDomain', cookieDomain)
        _gs('set', 'useCookies', config.useCookies)
        if (referrer) _gs('set', 'referrer', referrer)
        _gs('set', 'trackHash', config.trackHash)
        _gs('set', 'trackLocal', config.trackLocal)
        _gs('set', 'trackParams', config.trackParams)
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
      const { userId, traits } = payload
      const { first_name, last_name, email } = traits
      const hasRequiredField = email || userId
      if (typeof _gs !== 'undefined' && hasRequiredField) {
        // Format name
        let name = traits.name
        if (!name && (first_name && last_name)) {
          name = `${first_name} ${last_name}`
        }
        // Remove default attributes from traits object & keep custom
        const custom = Object.keys(traits).reduce((acc, key) => {
          if (defaultAttributes.includes(key)) return acc
          acc[key] = traits[key]
          return acc
        }, {})

        _gs('identify', {
          email: traits.email,
          id: userId,
          name: name,
          first_name: traits.first_name,
          last_name: traits.last_name,
          username: traits.username,
          description: traits.description,
          avatar: traits.avatar,
          phone: traits.phone,
          created_at: traits.created_at,
          company: traits.company,
          company_name: traits.company_name,
          company_size: traits.company_size,
          company_industry: traits.company_industry,
          company_position: traits.company_position,
          // Additional custom attributes
          custom: custom,
        })
      }
    },
    loaded: () => !!(window._gs && window._gs.push !== Array.prototype.push),
  }
}

// Default attributes https://www.gosquared.com/docs/api/javascript-tracking-code/identify-users/
const defaultAttributes = [
  'name',
  'first_name',
  'last_name',
  'username',
  'description',
  'avatar',
  'phone',
  'created_at',
  'company',
  'company_name',
  'company_size',
  'company_industry',
  'company_position',
]

export default goSquaredPlugin
