let Countly;
if (!process.browser) {
  Countly = require('countly-sdk-nodejs');
}

/**
 * Serverside Countly Analytics plugin
 * @param {object} pluginConfig - Plugin settings
 * @param {string} pluginConfig.app_key - Your app key from Countly
 * @param {string} pluginConfig.server_url - Url of the Countly server
 * @param {boolean} pluginConfig.debug - Set debug flag
 * @return {*}
 * @example
 *
 * countly({
 *    app_key: 'your_app_key',
 *    server_url: 'https://your_countly_server_url',
 *    debug: true
 * })
 */
function countlyPlugin(pluginConfig = {}) {
  return {
    name: 'countly',
    config: pluginConfig,
    /* https://support.count.ly/hc/en-us/articles/360037442892-NodeJS-SDK */
    initialize: ({ config }) => {
      const { app_key, server_url, debug } = config;
      if (!app_key) {
        throw new Error("Countly: No app_key provided");
      }

      if (!server_url) {
        throw new Error("Countly: No server_url provided");
      }

      Countly.init({
        app_key: app_key,
        server_url: server_url,
        debug: debug || false
      })
    },
    // page view
    page: ({ payload }) => {
      const { properties } = payload
      const { path } = properties
      Countly.track_view(path);
    },
    // track event
    track: ({ payload }) => {
      Countly.add_event({
        "key": payload.event,
        "count": 1,
        "segmentation": payload.properties
      });
    },
    /* identify user */
    identify: ({ payload }) =>  {
      const { userId, traits } = payload;
      let userObject = { custom: {} };
      // Countly has some predefined user properties
      let allowedProps = ["name", "username", "email", "organization", "phone", "picture", "gender", "byear"];
      if (typeof userId === "string") {
        Countly.change_id(userId);
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
      Countly.user_details(userObject);
    }
  }
}

export default countlyPlugin
