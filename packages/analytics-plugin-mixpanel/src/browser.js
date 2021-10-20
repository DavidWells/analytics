/**
 * Mixpanel Analytics plugin
 * @link https://getanalytics.io/plugins/mixpanel/
 * @param {object} pluginConfig - Plugin settings
 * @param {string} pluginConfig.token - The mixpanel token associated to a mixpanel project
 * @param {object} [pluginConfig.options] - The mixpanel init options https://github.com/mixpanel/mixpanel-js/blob/8b2e1f7b/src/mixpanel-core.js#L87-L110
 * @param {string} [pluginConfig.pageEvent] - Event name to use for page() events (default to page path)
 * @param {string} [pluginConfig.customScriptSrc] - Load mixpanel script from custom source
 * @return {object} Analytics plugin
 * @example
 *
 * mixpanelPlugin({
 *   token: 'abcdef123'
 * })
 */
function mixpanelPlugin(pluginConfig = {}) {
  return {
    name: "mixpanel",
    config: pluginConfig,
    /* https://developer.mixpanel.com/docs/javascript-full-api-reference#mixpanelinit */
    initialize: ({ config }) => {
      const { token, customScriptSrc, options = {} } = config;
      if (!token) {
        throw new Error("No mixpanel token defined");
      }

      // NoOp if mixpanel already loaded by external source or already loaded
      if (typeof window.mixpanel !== "undefined") {
        return;
      }

      // Load mixpanel library
      (function(c, a) {
        if (!a.__SV) {
          var b = window;
          try {
            var d,
              m,
              j,
              k = b.location,
              f = k.hash;
            d = function(a, b) {
              return (m = a.match(RegExp(b + "=([^&]*)"))) ? m[1] : null;
            };
            f &&
              d(f, "state") &&
              ((j = JSON.parse(decodeURIComponent(d(f, "state")))),
              "mpeditor" === j.action &&
                (b.sessionStorage.setItem("_mpcehash", f),
                history.replaceState(
                  j.desiredHash || "",
                  c.title,
                  k.pathname + k.search
                )));
          } catch (n) {}
          var l, h;
          window.mixpanel = a;
          a._i = [];
          a.init = function(b, d, g) {
            function c(b, i) {
              var a = i.split(".");
              2 == a.length && ((b = b[a[0]]), (i = a[1]));
              b[i] = function() {
                b.push([i].concat(Array.prototype.slice.call(arguments, 0)));
              };
            }
            var e = a;
            "undefined" !== typeof g ? (e = a[g] = []) : (g = "mixpanel");
            e.people = e.people || [];
            e.toString = function(b) {
              var a = "mixpanel";
              "mixpanel" !== g && (a += "." + g);
              b || (a += " (stub)");
              return a;
            };
            e.people.toString = function() {
              return e.toString(1) + ".people (stub)";
            };
            l = "disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(
              " "
            );
            for (h = 0; h < l.length; h++) c(e, l[h]);
            var f = "set set_once union unset remove delete".split(" ");
            e.get_group = function() {
              function a(c) {
                b[c] = function() {
                  call2_args = arguments;
                  call2 = [c].concat(Array.prototype.slice.call(call2_args, 0));
                  e.push([d, call2]);
                };
              }
              for (
                var b = {},
                  d = ["get_group"].concat(
                    Array.prototype.slice.call(arguments, 0)
                  ),
                  c = 0;
                c < f.length;
                c++
              )
                a(f[c]);
              return b;
            };
            a._i.push([b, d, g]);
          };
          a.__SV = 1.2;
          b = c.createElement("script");
          b.type = "text/javascript";
          b.async = !0;
          b.src = customScriptSrc
            ? customScriptSrc
            : "undefined" !== typeof MIXPANEL_CUSTOM_LIB_URL
            ? MIXPANEL_CUSTOM_LIB_URL
            : "file:" === c.location.protocol &&
              "//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//)
            ? "https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js"
            : "//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";
          d = c.getElementsByTagName("script")[0];
          d.parentNode.insertBefore(b, d);
        }
      })(document, window.mixpanel || []);

      mixpanel.init(config.token, { batch_requests: true, ...options });
    },
    /**
     * Identify a visitor in mixpanel
     * @link https://developer.mixpanel.com/docs/javascript-full-api-reference#mixpanelidentify
     *
     * Mixpanel doesn't allow to set properties directly in identify, so mixpanel.people.set is
     * also called if properties are passed
     */
    identify: ({ payload }) => {
      const { userId, traits } = payload;
      if (typeof userId === "string") {
        mixpanel.identify(userId);
      }
      if (traits) {
        mixpanel.people.set(traits);
      }
    },
    /**
     * Mixpanel doesn't have a "page" function, so we are using the track method by sending
     * the path as tracked event and search parameters as properties
     */
    page: ({ payload }) => {
      mixpanel.track(pluginConfig.pageEvent || payload.properties.path, payload.properties);
    },
    /* https://developer.mixpanel.com/docs/javascript-full-api-reference#mixpaneltrack */
    track: ({ payload }) => {
      mixpanel.track(payload.event, payload.properties);
    },
    loaded: () => {
      return !!window.mixpanel;
    },
    /* Clears super properties and generates a new random distinct_id for this instance. Useful for clearing data when a user logs out. */
    reset: () => {
      mixpanel.reset();
    },
    /* Custom methods to add .alias call */
    methods: {
      /**
       * The alias method creates an alias which Mixpanel will use to remap one id to another. Multiple aliases can point to the same identifier.
       * @link https://developer.mixpanel.com/docs/javascript-full-api-reference#mixpanelalias
       *
       * @param  {string} [alias] - A unique identifier that you want to use for this user in the future.
       * @param  {string} [original] - The current identifier being used for this user.
       */
      alias(alias, original) {
        mixpanel.alias(alias, original);
      },
    },
  };
}

export default mixpanelPlugin;
