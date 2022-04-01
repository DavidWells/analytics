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
 * countly({
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
        throw new Error("No app_key provided");
      }

      if (!server_url) {
        throw new Error("No server_url provided");
      }

      // NoOp if countly already loaded by external source or already loaded
      if (typeof window.Countly !== "undefined") {
        return;
      }

      // Load Countly library
      var Countly = Countly || {};
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
        cly.onload = function(){Countly.init()};
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
      const { userId, traits } = payload;
      let userObject = { custom: {} };
      // Countly has some predefined user properties
      let allowedProps = ["name", "username", "email", "organization", "phone", "picture", "gender", "byear"];
      if (typeof userId === "string") {
        Countly.q.push(['change_id', userId]);
      }
      if (traits) {
        for (trait in traits) {
          if (allowedProps[trait]) {
            userObject[allowedProps[trait]] = traits[trait];
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
    track: ({ eventName, payload }) => {
      Countly.q.push(['add_event',{
        "key": eventName,
        "count": 1,
        "segmentation": payload
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
    },
    /* Custom methods */
    methods: {
      initializeFeedback() {
        // Fetch user's NPS and Survey feedbacks from the server
        Countly.q.push(['get_available_feedback_widgets', function(countlyPresentableFeedback, err) {
          if (err) {
            console.log(err);
            return;
          }
      
          //The available feedback types are nps and survey, decide which one to show
          var countlyFeedbackWidget = countlyPresentableFeedback[0];

          //Define the element ID and the class name
          var selectorId = "targetIdSelector";
          var selectorClass = "targetClassSelector";

          //Display the feedback widget to the end user
          Countly.present_feedback_widget(countlyFeedbackWidget, selectorId, selectorClass);
        }]);
      },
      enablePageViewTracking() {
        Countly.q.push(['track_pageview']);
      },
      enableSessionTracking() {
        Countly.q.push(['track_sessions']);
      },
      // call this method for web heatmaps (enterprise edition only)
      enableClickTracking() {
        Countly.q.push(['track_clicks']);
      },
      // call this method for web scrollmaps (enterprise edition only)
      enableScrollTracking() {
        Countly.q.push(['track_scrolls']);
      },
      enableErrorTracking() {
        Countly.q.push(['track_errors']);
      },
      // get whole remote config object or specific value by passing key
      getRemoteConfigs(key) {
        if (key) {
          return Countly.get_remote_config(key);
        }
        else {
          return Countly.get_remote_configs();
        }
      },
      reloadRemoteConfigs() {
        Countly.fetch_remote_config(function(err) {
          if (!err) {
            console.log("Countly remote config object reloaded.");
          }
          else {
            console.error("Countly remote config object reload failed.");
          }
        });
      },
      // to stop tracking user data call
      optOut() {
        Countly.q.push(['opt_out']);
      },
      // to resume tracking user data call
      optIn() {
        Countly.q.push(['opt_in']);
      },
      /* check official docs for detailed reference: https://support.count.ly/hc/en-us/articles/360037441932-Web-analytics-JavaScript-#user-consent */
      /**
       * Add consent to the user
       * @param {object} - ["activity", "interaction", "crashes"] - string array that contain consents
       *  */
      addConsent(consents) {
        Countly.q.push(['add_consent', consents]);
      }
    }
  };
}

export default countlyPlugin;
