/* global analytics */

const config = {
  /* Your segment writeKey */
  writeKey: null,
  /* Disable anonymous MTU */
  disableAnonymousTraffic: false,
  /* Sync segment Anonymous id with `analytics` Anon id */
  syncAnonymousId: false,
  /* Enable/disable segment destinations https://bit.ly/38nRBj3 */
  integrations: {}
  /* Override the Segment snippet url, for loading via custom CDN proxy */
}

/**
 * Segment analytics plugin
 * @link https://getanalytics.io/plugins/segment/
 * @link https://segment.com/docs/sources/website/analytics.js/
 * @param {object}  pluginConfig - Plugin settings
 * @param {string}  pluginConfig.writeKey - Your segment writeKey
 * @param {boolean} [pluginConfig.disableAnonymousTraffic] - Disable loading segment for anonymous visitors
 * @param {boolean} [pluginConfig.customScriptSrc] - Override the Segment snippet url, for loading via custom CDN proxy
 * @param {object}  [pluginConfig.integrations] - Enable/disable segment destinations https://bit.ly/38nRBj3
 * @return {object} Analytics plugin
 * @example
 *
 * segmentPlugin({
 *   writeKey: '123-xyz'
 * })
 */
function segmentPlugin(pluginConfig = {}) {
  return {
    name: 'segment',
    config: {
      ...config,
      ...pluginConfig
    },
    /* Custom methods to add .group call */
    methods: {
      /* Group https://segment.com/docs/connections/sources/catalog/libraries/website/javascript/#group */
      group(groupId, traits = {}, options = {}, callback) {
        // const analyticsInstance = this.instance
        // If no segment, return early
        if (typeof window.analytics === 'undefined') {
          return
        }
        // Make group call to segment
        window.analytics.group(groupId, traits, options, callback)
      },
    },
    bootstrap: ({ config, instance }) => {
      /* Load segment script after userId exists */
      if (config.disableAnonymousTraffic && !instance.user('userId')) {
        instance.once('identifyStart', ({ plugins }) => {
          const self = plugins['segment']
          if (!self.loaded()) {
            instance.loadPlugin('segment')
          }
        })
      }
    },
    /* Load Segment analytics.js on page */
    initialize: ({ config, instance, payload }) => {
      const { disableAnonymousTraffic, writeKey, customScriptSrc } = config
      if (!writeKey) {
        throw new Error('No segment writeKey')
      }
      /* Disable segment.com if user is not yet identified. Save on Monthly MTU bill $$$ */
      const userID = instance.user('userId')
      if (!userID && disableAnonymousTraffic) {
        return false
      }
      /* eslint-disable */
      !function() {
        var analytics = window.analytics = window.analytics || []

        function isScriptLoaded() {
          const scripts = document.getElementsByTagName('script')
          const scriptMatch = customScriptSrc || 'cdn.segment.com/analytics.js/v1/'
          return !!Object.keys(scripts).filter((key) => {
            const scriptInfo = scripts[key] || {}
            const src = scriptInfo.src || ''
            return src.indexOf(scriptMatch) > -1
          }).length
        }

        if (!analytics.initialize) {
          if (!isScriptLoaded()) {
            analytics.invoked = !0;
            analytics.methods = ["trackSubmit", "trackClick", "trackLink", "trackForm", "pageview", "identify", "reset", "group", "track", "ready", "alias", "debug", "page", "once", "off", "on"];
            analytics.factory = function(t) {
              return function() {
                var e = Array.prototype.slice.call(arguments);
                e.unshift(t);
                analytics.push(e);
                return analytics
              }
            };
            for (var t = 0; t < analytics.methods.length; t++) {
              var e = analytics.methods[t];
              analytics[e] = analytics.factory(e)
            }
            analytics.load = function(t, e) {
              var n = document.createElement("script");
              n.type = "text/javascript";
              n.async = !0;
              n.src = customScriptSrc || "https://cdn.segment.com/analytics.js/v1/" + t + "/analytics.min.js";
              n.id = 'segment-io'
              var a = document.getElementsByTagName("script")[0];
              a.parentNode.insertBefore(n, a);
              analytics._loadOptions = e
            };
            analytics.SNIPPET_VERSION = "4.1.0";
            analytics.load(writeKey);
          }
        }
      }();
      /* eslint-enable */
    },
    /* Trigger Segment page view http://bit.ly/2LSPFr1 */
    page: ({ payload, config }) => {
      if (typeof analytics === 'undefined') return
      const properties = payload.properties || {}
      const name = properties.name || properties.title
      const category = properties.category
      
      analytics.page(category, name, properties, {
        integrations: config.integrations,
        ...payload.options,
      })
    },
    /* Track Segment event http://bit.ly/2WLnYkK */
    track: ({ payload, config }) => {
      if (typeof analytics === 'undefined') return

      analytics.track(payload.event, payload.properties, {
        integrations: config.integrations,
        ...payload.options,
      })
    },
    /* Identify Segment user http://bit.ly/2VL45xD */
    identify: ({ payload, config }) => {
      if (typeof analytics === 'undefined') return

      const { userId, traits, options } = payload

      if (typeof userId === 'string') {
        analytics.identify(userId, traits, {
          integrations: config.integrations,
          ...options,
        })
      } else {
        analytics.identify(traits, {
          integrations: config.integrations,
          ...options,
        })
      }
    },
    /* Remove segment cookies on analytics.reset */
    reset: () => {
      if (typeof analytics === 'undefined') return
      analytics.reset();
    },
    /* Sync id when ready */
    ready: ({ instance, config }) => {
      if (!config.syncAnonymousId || typeof analytics === 'undefined') return
      const segmentUser = analytics.user()
      if (segmentUser) {
        const segmentAnonId = segmentUser.anonymousId()
        const analyticsAnonId = instance.user('anonymousId')
        // If has segment anonymous ID && doesnt match analytics anon id, update
        if (segmentAnonId && segmentAnonId !== analyticsAnonId) {
          instance.setAnonymousId(segmentAnonId)
        }
      }
    },
    /* Check if segment loaded */
    loaded: () => {
      return window.analytics && !!analytics.initialized
    }
  }
}

export default segmentPlugin
