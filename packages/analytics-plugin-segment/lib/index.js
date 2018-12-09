/**
 * Segment analytics integration
 */
import { inBrowser, extend } from 'analytics-utils'

/* integration namespace. Must be unique */
export const NAMESPACE = 'segment'

export const config = {
  assumesPageview: true,
  disableAnonymousTraffic: false
}

/* initialize Segment script */
export const initialize = (configuration, instance) => {
  const { disableAnonymousTraffic, trackingId, assumesPageview } = configuration
  const user = instance('user')
  if (!trackingId) {
    throw new Error('No Setting id defined')
  }
  // Disable segment.com if user is not yet identified. Save on MTU
  if ((!user || !user.userId) && disableAnonymousTraffic) {
    return false
  }
  /* eslint-disable */
  !function() {
    var analytics = window.analytics = window.analytics || [];

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
          analytics.page();
        }
      }
    }
  }();
}

/* Trigger Segment page view */
export const page = (pageData, options, instance) => {
  analytics.page()
}

/* Track Segment event */
export const track = (eventName, payload, options, instance) => {
  console.log(`Segment Event > [${eventName}] [payload: ${JSON.stringify(payload, null, 2)}]`)
  analytics.track(eventName, payload)
}

/* Identify Segment user */
export const identify = (userId, traits, options, instance) => {
  console.log('Segment identify', userId, traits, options)
  analytics.identify(userId, traits)
}

export const loaded = function() {
  if (!inBrowser) {
    return false
  }
  return window.analytics && !!analytics.initialized
}

/* export the integration */
export default function SegmentIntegration(userConfig) {
  const mergedConfig = {
    // default config
    ...config,
    // user land config
    ...userConfig
  }
  return {
    NAMESPACE: NAMESPACE,
    config: mergedConfig,
    initialize: extend('initialize', initialize, mergedConfig),
    page: extend('page', page, mergedConfig),
    track: extend('track', track, mergedConfig),
    identify: extend('identify', identify, mergedConfig),
    loaded: extend('loaded', loaded, mergedConfig)
  }
}
