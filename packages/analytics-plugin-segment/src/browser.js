/* global analytics */

const config = {
  /* Your segment writeKey */
  writeKey: null,
  /* Disable anonymous MTU */
  disableAnonymousTraffic: false,
  /* Sync segment Anonymous id with `analytics` Anon id */
  syncAnonymousId: false
}

/**
 * Segment analytics plugin
 * @link https://segment.com/docs/sources/website/analytics.js/
 * @param {object}  pluginConfig - Plugin settings
 * @param {string}  pluginConfig.writeKey - Your segment writeKey
 * @param {boolean} [pluginConfig.disableAnonymousTraffic] - Disable loading segment for anonymous visitors
 * @return {object} Analytics plugin
 * @example
 *
 * segmentPlugin({
 *   writeKey: '123-xyz'
 * })
 */
export default function segmentPlugin(pluginConfig = {}) {
  return {
    NAMESPACE: 'segment',
    config: {
      ...config,
      ...pluginConfig
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
    initialize,
    /* Trigger Segment page view http://bit.ly/2LSPFr1 */
    page: ({ payload }) => {
      if (typeof analytics === 'undefined') return

      analytics.page(payload.properties)
    },
    /* Track Segment event http://bit.ly/2WLnYkK */
    track: ({ payload }) => {
      if (typeof analytics === 'undefined') return

      analytics.track(payload.event, payload.properties)
    },
    /* Identify Segment user http://bit.ly/2VL45xD */
    identify: ({ payload }) => {
      if (typeof analytics === 'undefined') return
      const { userId, traits } = payload

      if (typeof userId === 'string') {
        analytics.identify(userId, traits)
      } else {
        analytics.identify(traits)
      }
    },
    /* Remove segment cookies on analytics.reset */
    reset: ({ instance }) => {
      const cookies = ['ajs_user_id', 'ajs_anonymous_id', 'ajs_group_id']
      cookies.forEach((key) => {
        instance.storage.removeItem(key, 'cookie')
      })
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

/* Load Segment analytics.js on page */
function initialize({ config, instance, payload }) {
  const { disableAnonymousTraffic, writeKey } = config
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
      return !!Object.keys(scripts).filter((key) => {
        const { src } = scripts[key]
        return src.match(/cdn\.segment\.com\/analytics.js\/v1\//)
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
          n.src = "https://cdn.segment.com/analytics.js/v1/" + t + "/analytics.min.js";
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
}
