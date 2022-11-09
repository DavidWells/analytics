/**
 * Countly Analytics plugin
 * @link https://getanalytics.io/plugins/countly/
 * @param {object} pluginConfig - Plugin settings
 * @param {string} pluginConfig.app_key - Your app key from Countly
 * @param {string} pluginConfig.server_url - Url of the Countly server
 * @param {boolean} pluginConfig.remote_config - Remote config enabler flag
 * @param {boolean} pluginConfig.require_consent - Disable tracking until given consent (default: false)
 * @return {object} Analytics plugin
 * @example
 *
 * countlyPlugin({
    app_key: 'YOUR_APP_KEY',
    server_url: 'https://YOUR_COUNTLY_SERVER_URL',
    remote_config: true,
    require_consent: true
 * })
 */
function countlyPlugin(pluginConfig = {}) {
  return {
    name: "countly",
    config: pluginConfig,
    /* https://support.count.ly/hc/en-us/articles/360037441932-Web-analytics-JavaScript- */
    initialize: ({ config }) => {
      const { app_key, server_url, remote_config, require_consent } = config;
      if (!app_key) {
        throw new Error("Countly: No app_key provided");
      }

      if (!server_url) {
        throw new Error("Countly: No server_url provided");
      }

      // NoOp if countly already loaded by external source or already loaded
      if (typeof window.Countly === "undefined") {
        window.Countly = {};
      }

      Countly.q = Countly.q || [];
      Countly.require_consent = require_consent || false;

      // Provide your app key that you retrieved from Countly dashboard
      Countly.app_key = app_key;

      // Provide your server IP or name. Use try.count.ly or us-try.count.ly
      // or asia-try.count.ly for EE trial server.
      // If you use your own server, make sure you have https enabled if you use
      // https below.
      Countly.url = server_url;

      if (typeof remote_config === "boolean") {
        Countly.remote_config = remote_config;
      }

      // Load Countly script asynchronously
      (function() {
        var cly = document.createElement('script'); cly.type = 'text/javascript';
        cly.async = true;
        // Enter url of script here (see below for other option)
        cly.src = 'https://cdn.jsdelivr.net/npm/countly-sdk-web@latest/lib/countly.min.js';
        cly.onload = function(){ Countly.init() };
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(cly, s);
      })();
    },
    /**
     * Identify a visitor in Countly
     * @link https://support.count.ly/hc/en-us/articles/360037441932-Web-analytics-JavaScript-#user-profiles
     *
     * You can check our web sdk documentation for more information
     * about allowed properties and how to use them.
     */
    identify: ({ payload }) => {
      let userObject = { custom: {} };
      let { userId, traits } = payload;

      // Countly has some predefined user properties
      let allowedProps = ["name", "username", "email", "organization", "phone", "picture", "gender", "byear"];
      if (typeof userId === "string") {
        Countly.q.push(['change_id', userId]);
      }
      if (traits) {
        for (let trait in traits) {
          if (allowedProps.indexOf(trait) > -1) {
            userObject[trait] = traits[trait];
          }
          else {
            userObject.custom[trait] = traits[trait];
          }
        }
      }
      Countly.q.push(['user_details', userObject]);
    },
    /* https://support.count.ly/hc/en-us/articles/360037441932-Web-analytics-JavaScript-#view-tracking */
    page: ({ payload }) => {
      Countly.q.push(['track_pageview', payload.properties.path]);
    },
    /* https://support.count.ly/hc/en-us/articles/360037441932-Web-analytics-JavaScript-#events */
    track: ({ payload }) => {
      Countly.q.push(['add_event',{
        "key": payload.event,
        "count": 1,
        "segmentation": payload.properties
      }]);
    },
    loaded: () => {
      return !!window.Countly;
    },
    /* Clears all countly related configs from browser storage. */
    reset: () => {
      localStorage.removeItem(Countly.app_key + '/cly_id');
      localStorage.removeItem(Countly.app_key + '/cly_queue');
      localStorage.removeItem(Countly.app_key + '/cly_fb_widgets');
      localStorage.removeItem(Countly.app_key + '/cly_remote_configs');
      localStorage.removeItem(Countly.app_key + '/cly_session');
      localStorage.removeItem(Countly.app_key + '/cly_event');
    }
  };
}

export default countlyPlugin;
