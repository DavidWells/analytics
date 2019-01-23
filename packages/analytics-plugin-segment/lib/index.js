/**
 * Segment analytics plugin
 */
const inBrowser = typeof window !== 'undefined'

/* Plugin namespace. Must be unique */
export const NAMESPACE = 'segment'

const defaultConfig = {
  assumesPageview: true,
  disableAnonymousTraffic: false
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
  const { disableAnonymousTraffic, trackingId, assumesPageview } = config
  // alert(`Plugin Segment: initialize ${JSON.stringify(action)}`)
  if (!trackingId) {
    throw new Error('No Setting id defined')
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
        analytics.load(trackingId);

        if (assumesPageview) {
          analytics.page()
        }
      }
    }
  }();
}

/* Trigger Segment page view */
export const page = ({ payload }) => {
  alert(`Segment page ${JSON.stringify(payload)}`)
  if (inBrowser && typeof analytics !== 'undefined') {
    analytics.page()
  }
}

/* Track Segment event */
export const track = ({ payload }) => {
  const { event, properties } = payload
  console.log(`Segment Event > [${payload.event}] [payload: ${JSON.stringify(properties, null, 2)}]`)
  if (inBrowser && typeof analytics !== 'undefined') {
    analytics.track(event, properties)
  }
}

/* Identify Segment user */
export const identify = ({ payload }) => {
  const { userId, traits } = payload
  if (inBrowser && typeof analytics !== 'undefined' && userId) {
    analytics.identify(userId, traits)
  }
}

export const loaded = function() {
  if (!inBrowser) return true
  return window.analytics && !!analytics.initialized
}

/* export the plugin */
export default function SegmentPlugin(userConfig) {
  return {
    NAMESPACE: NAMESPACE,
    config: {
      // default config
      ...defaultConfig,
      // user land config
      ...userConfig
    },
    initialize,
    page,
    track,
    identify,
    loaded, //: () => { return true},
    // trackStart: () => {
    //   alert('seg before')
    // },
    ready: () => {
      console.log('READY= Segment')
    }
  }
}
