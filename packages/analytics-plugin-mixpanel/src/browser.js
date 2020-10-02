const mixpanel = require("mixpanel-browser");

/**
 * Mixpanel Analytics plugin
 * @link https://getanalytics.io/plugins/mixpanel/
 * @param {object} pluginConfig - Plugin settings
 * @param {string} pluginConfig.token - The mixpanel token associated to a mixpanel project
 * @return {object} Analytics plugin
 * @example
 *
 * mixpanelPlugin({
 *   token: 'abcdef123'
 * })
 */
function mixpanelPlugin(pluginConfig = {}) {
  let isMixpanelLoaded = false;
  return {
    NAMESPACE: "mixpanel",
    config: pluginConfig,
    /* https://developer.mixpanel.com/docs/javascript-full-api-reference#mixpanelinit */
    initialize: ({ config }) => {
      const { token } = config;
      if (!token) {
        throw new Error("No mixpanel token defined");
      }
      mixpanel.init(config.token, { batch_requests: true });
      isMixpanelLoaded = true;
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
      mixpanel.track(payload.properties.path, {
        search: payload.properties.search,
      });
    },
    /* https://developer.mixpanel.com/docs/javascript-full-api-reference#mixpaneltrack */
    track: ({ payload }) => {
      mixpanel.track(payload.event, payload.properties);
    },
    loaded: () => {
      return isMixpanelLoaded;
    },
  };
}

export default mixpanelPlugin;