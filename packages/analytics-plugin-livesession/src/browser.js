/* global __ls */

/**
 * https://livesession.dev/docs/api/browser/methods#options-signature
 */
const defaultConfig = {
  keystrokes: "",
  rootHostname: false,
}

/**
 * LiveSession Analytics plugin
 * @link https://getanalytics.io/plugins/livesession
 * @link https://livesession.dev/docs/api/browser/methods
 *
 * @param {string} trackId - LiveSession Track ID
 * @param {string} pluginConfig.keystrokes - Enable global keystroke tracking
 * @param {string} pluginConfig.rootHostname - Set this to the highest-level hostname to record session across different subdomains on your site
 *
 * @return {object} Analytics plugin
 *
 * @example:
 * 1. livesessionPlugin("your-track-id", {})
 * 2. livesessionPlugin("your-track-id", { keystrokes: true })
 */
export default function livesessionPlugin(trackId = "", pluginConfig = {}) {
  return {
    name: 'livesession',
    config: {
      ...defaultConfig,
      ...pluginConfig,
      trackId: trackId,
    },

    initialize: ({ config }) => {
      if (!config.trackId) {
        throw new Error('No trackId supplied for LiveSession')
      }

      appendSnippet()

      if (typeof __ls === 'undefined') {
        throw new Error('LiveSession script not loaded')
      }

      const {
        trackId,
        ...restConfig
      } = config

      __ls("init", trackId, restConfig || {})
      __ls("newPageView")
    },

    /**
     * https://livesession.dev/docs/api/browser/methods#identify
     */
    identify: ({ payload, config }) => {
      if (typeof __ls === 'undefined') {
        return false
      }

      const { userId, anonymousId, traits } = payload

      __ls("identify", {
        userId: userId || anonymousId,
        ...traits || {}
      })
    },

    /**
     * https://livesession.dev/docs/api/browser/methods#track
     */
    track: ({ payload, options, config }) => {
      if (typeof __ls === 'undefined') {
        return false
      }

      __ls.track(payload.event, payload.properties)
    },

    loaded: () => {
      return !!window.__ls
    },
  }
}

/**
 * https://github.com/livesession/livesession-browser/blob/master/src/snippet.ts
 */
export const defaultScriptURL = "https://cdn.livesession.io/track.js"

const appendSnippet = (
    wnd = window,
    doc = document,
    type = "script",
    scriptURL = defaultScriptURL,
) => {
  return ((w, d, t, u) => {
    if (w.__ls) {
      throw new Error("LiveSession script already added");
    }
    const f = (w.__ls = function () {
      f.push ? f.push.apply(f, arguments) : f.store.push(arguments);
    });
    if (!w.__ls) w.__ls = f;
    f.store = [];
    f.v = "1.1";

    const ls = d.createElement(t);
      ls.async = true;
      ls.src = u;
      ls.charset = "utf-8";
      ls.crossOrigin = "anonymous";
      const h = d.getElementsByTagName("head")[0];
      h.appendChild(ls);
  })(wnd, doc, type, scriptURL);
};
