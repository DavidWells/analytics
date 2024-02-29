/**
 * Amplitude plugin
 * @link https://getanalytics.io/plugins/amplitude/
 * @link https://amplitude.com/
 * @link https://developers.amplitude.com
 * @param {object} pluginConfig - Plugin settings
 * @param {string} pluginConfig.apiKey - Amplitude project API key
 * @param {object} pluginConfig.options - Amplitude SDK options
 * @param {string} pluginConfig.initialSessionId - Set initial session ID
 * @return {*}
 * @example
 *
 * amplitudePlugin({
 *   apiKey: 'token',
 *   // See options at https://bit.ly/3dRdZnE
 *   options: { 
 *     trackingOptions: {
 *       ip_address: false 
 *     } 
 *   }
 * })
 */
function amplitudePlugin(pluginConfig = {}) {
  // Amplitude client instance.
  let client = null;
  // Flag is set to true after amplitude client instance is initialized.
  let amplitudeInitCompleted = false;

  const initComplete = (d) => {
    client = d;
    amplitudeInitCompleted = true;
  };

  return {
    name: "amplitude",
    config: pluginConfig,
    // For Amplitude options, see https://amplitude.github.io/Amplitude-JavaScript/Options
    initialize: ({ config }) => {
      const { apiKey, initialSessionId, customScriptSrc, integritySha = '', options = {} } = config
      if (!apiKey) {
        throw new Error("Amplitude project API key is not defined")
      }
      if (options && typeof options !== "object") {
        throw new Error("Amplitude SDK options must be an object")
      }

      // Already loaded
      if (typeof window.amplitude !== 'undefined') {
        return
      }
      
      const scriptSrc = customScriptSrc ? customScriptSrc : 'https://cdn.amplitude.com/libs/analytics-browser-2.0.0-min.js.gz'

      // Fix https://bit.ly/3m7EBGi
      let integrity
      if (integritySha) {
        // Use custom sha if provided
        integrity = integritySha
      } else if (!customScriptSrc) {
        // Use default 'https://cdn.amplitude.com/libs/amplitude-8.1.0-min.gz.js' sha
        integrity = 'sha384-x0ik2D45ZDEEEpYpEuDpmj05fY91P7EOZkgdKmq4dKL/ZAVcufJ+nULFtGn0HIZE'
      }

      // Initialize amplitude js
      ;(function(e, t) {
        var n = e.amplitude || { _q: [], _iq: {} }
        if (n.invoked)
          e.console &&
            console.error &&
            console.error("Amplitude snippet has been loaded.")
        else {
          var r = function (e, t) {
            e.prototype[t] = function () {
              return (
                this._q.push({
                  name: t,
                  args: Array.prototype.slice.call(arguments, 0),
                }),
                this
              )
            }
          },
            s = function (e, t, n) {
              return function (r) {
                e._q.push({
                  name: t,
                  args: Array.prototype.slice.call(n, 0),
                  resolve: r,
                })
              }
            },
            o = function (e, t, n) {
              e[t] = function () {
                if (n)
                  return {
                    promise: new Promise(
                      s(e, t, Array.prototype.slice.call(arguments))
                    ),
                  }
              }
            },
            i = function (e) {
              for (var t = 0; t < m.length; t++) o(e, m[t], !1)
              for (var n = 0; n < g.length; n++) o(e, g[n], !0)
            }
          n.invoked = !0
          var u = t.createElement("script")
            ; (u.type = "text/javascript"),
              (u.integrity =
                "sha384-x0ik2D45ZDEEEpYpEuDpmj05fY91P7EOZkgdKmq4dKL/ZAVcufJ+nULFtGn0HIZE"),
              (u.crossOrigin = "anonymous"),
              (u.async = !0),
              (u.src =
                "https://cdn.amplitude.com/libs/analytics-browser-2.0.0-min.js.gz"),
              (u.onload = function () {
                e.amplitude.runQueuedFunctions ||
                  console.log("[Amplitude] Error: could not load SDK")
              })
          var a = t.getElementsByTagName("script")[0]
          a.parentNode.insertBefore(u, a)
          for (
            var c = function () {
              return (this._q = []), this
            },
            p = [
              "add",
              "append",
              "clearAll",
              "prepend",
              "set",
              "setOnce",
              "unset",
              "preInsert",
              "postInsert",
              "remove",
              "getUserProperties",
            ],
            l = 0;
            l < p.length;
            l++
          )
            r(c, p[l])
          n.Identify = c
          for (
            var d = function () {
              return (this._q = []), this
            },
            f = [
              "getEventProperties",
              "setProductId",
              "setQuantity",
              "setPrice",
              "setRevenue",
              "setRevenueType",
              "setEventProperties",
            ],
            v = 0;
            v < f.length;
            v++
          )
            r(d, f[v])
          n.Revenue = d
          var m = [
            "getDeviceId",
            "setDeviceId",
            "getSessionId",
            "setSessionId",
            "getUserId",
            "setUserId",
            "setOptOut",
            "setTransport",
            "reset",
            "extendSession",
          ],
            g = [
              "init",
              "add",
              "remove",
              "track",
              "logEvent",
              "identify",
              "groupIdentify",
              "setGroup",
              "revenue",
              "flush",
            ]
          i(n),
            (n.createInstance = function (e) {
              return (n._iq[e] = { _q: [] }), i(n._iq[e]), n._iq[e]
            }),
            (e.amplitude = n)
        }
      })(window, document);
      // See options at https://www.docs.developers.amplitude.com/data/sdks/browser-2/#configuration
      window.amplitude.init(config.apiKey, options).promise.then(() => initComplete(window.amplitude));


      // Set initial session id. Ref https://bit.ly/3vElAym
      if (initialSessionId) {
        setTimeout(() => setSessionId(initialSessionId), 10)
      }
    },

    page: ({ payload: { properties, options } }) => {
      let eventType = "Page View"
      if (options && options.eventType) {
        eventType = options.eventType
      }
      client.track(eventType, properties)
    },

    track: ({ payload: { event, properties } }) => {
       client.track(event, properties)
    },

    identify: ({ payload: { userId, traits }, instance }) => {
      const identifyEvent = new window.amplitude.Identify();
      identifyEvent.set("user_id", userId);
      client.identify(identifyEvent);
    },

    loaded: () => amplitudeInitCompleted,

    // https://getanalytics.io/plugins/writing-plugins/#adding-custom-methods
    methods: {
      /**
       * analytics.plugins['amplitude'].setSessionId('your-id')
       */
      setSessionId: setSessionId,
    }
  }
}

/**
 * Set Amplitude session ID. Ref https://bit.ly/3vElAym
 * @param {string} sessionId - Minimum visit length before first page ping event fires
 */
function setSessionId(sessionId) {
  if (typeof window.amplitude === 'undefined') {
    console.log('Amplitude not loaded yet')
    return false
  }
  window.amplitude.setSessionId(sessionId)
}

export default amplitudePlugin