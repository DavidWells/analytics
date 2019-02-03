/**
 * Segment analytics plugin
 * https://segment.com/docs/sources/website/analytics.js/
 */
/* global analytics */

const NAMESPACE = 'segment'

const defaultConfig = {
  assumesPageview: true,
  disableAnonymousTraffic: false
}

/* export the plugin */
export default function SegmentPlugin(userConfig) {
  return {
    NAMESPACE: 'segment',
    config: {
      // default config
      ...defaultConfig,
      // user land config
      ...userConfig
    },
    initialize,
    /* Trigger Segment page view */
    page: ({ payload }) => {
      if (typeof analytics !== 'undefined') {
        analytics.page(payload.properties)
      }
    },
    /* Track Segment event */
    track: ({ payload }) => {
      if (typeof analytics !== 'undefined') {
        analytics.track(payload.event, payload.properties)
      }
    },
    /* Identify Segment user */
    identify: ({ payload }) => {
      const { userId, traits } = payload
      if (typeof analytics !== 'undefined' && userId) {
        analytics.identify(userId, traits)
      }
    },
    loaded: () => {
      return window.analytics && !!analytics.initialized
    }
  }
}

let added = false
function loadScriptAfterUserHasId(instance) {
  if (added) return false
  instance.once('identify', (action) => {
    instance.loadPlugin(NAMESPACE)
  })
  added = true
}

/* initialize Segment script */
export const initialize = ({ config, instance }) => {
  const { disableAnonymousTraffic, writeKey, assumesPageview } = config
  // alert(`Plugin Segment: initialize ${JSON.stringify(action)}`)
  if (!writeKey) {
    throw new Error('No segment writeKey')
  }
  const user = instance.user()
  // Disable segment.com if user is not yet identified. Save on Monthly MTU bill
  if ((!user || !user.userId) && disableAnonymousTraffic) {
    // load segment when user identified
    loadScriptAfterUserHasId(instance)
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
}
