import browserLoadMixpanel from './browserLoadMixpanel';

/**
  * @typedef {Object} MixpanelPluginConfig - Plugin settings for Mixpanel plugin
  * @property {String} [token] - The mixpanel token associated to a mixpanel project
  * @property {Object} [mixpanel] - The mixpanel instance - use this
  *   to use the plugin with a mixpanel instance instantiated elsewhere, for
  *   example when using a mixpanel npm package.
  * @property {Object} [context] - The context object where mixpanel
  *   instance is found and assigned to when instantiated. Defaults to window.
  * @property {Object} [config] - Mixpanel config passed to `mixpanel.init()`
  *   in `initialize` step.
  *   If mixpanel instance already exists, it is updated with this config
  *   using `mixpanel.set_config()`.
  */

/**
 * Get mixpanel instance from config
 * @param {MixpanelPluginConfig} config
 * @returns {Object} Mixpanel instance
 */
const resolveMixpanel = (config = {}) => {
  const { context = window, mixpanel: givenMixpanel } = config;
  return givenMixpanel || context.mixpanel;
}

/**
 * Mixpanel Analytics plugin
 * @link https://getanalytics.io/plugins/mixpanel/
 * @param {MixpanelPluginConfig} pluginConfig - Plugin settings
 * @return {AnalyticsPlugin} Analytics plugin
 * @example
 *
 * // Load Mixpanel instance to `window`
 * mixpanelPlugin({
 *   token: 'abcdef123',
 * });
 *
 * // Load Mixpanel instance to `context` object instead of `window`
 * const myContext = {};
 * mixpanelPlugin({
 *   token: 'abcdef123',
 *   context: myContext,
 * });
 *
 * // Use existing mixpanel instance
 * import mixpanel from 'mixpanel-browser';
 * mixpanelPlugin({
 *   mixpanel: mixpanel.init('abcdef123'),
 * });
 *
 * // Pass mixpanel config
 * mixpanelPlugin({
 *   token: 'abcdef123',
 *   config: {
 *     api_host: 'https://api-eu.mixpanel.com',
 *   },
 * });
 */
function mixpanelPlugin(pluginConfig = {}) {
  const plugin = {
    NAMESPACE: "mixpanel",
    config: pluginConfig,
    /* https://developer.mixpanel.com/docs/javascript-full-api-reference#mixpanelinit */
    initialize: ({ config }) => {
      const {
        token,
        context = window,
        config: mixpanelConfig,
      } = config || {};

      let mixpanel = resolveMixpanel(config);

      const hasMixpanel = Boolean(mixpanel);
      const shouldApplyConfig = Boolean(mixpanelConfig);

      if (hasMixpanel) {
        // NoOp if mixpanel already loaded by external source or already loaded
        if (!shouldApplyConfig) return;
        // Update mixpanel to config passed to the plugin
        mixpanel.set_config(mixpanelConfig);
      }

      if (!hasMixpanel) {
        if (!token) {
          throw new Error("No mixpanel token defined");
        }

        mixpanel = browserLoadMixpanel(context);
        mixpanel.init(token, { batch_requests: true, ...mixpanelConfig });
      }
    },
    /**
     * Identify a visitor in mixpanel
     * @link https://developer.mixpanel.com/docs/javascript-full-api-reference#mixpanelidentify
     *
     * Mixpanel doesn't allow to set properties directly in identify, so mixpanel.people.set is
     * also called if properties are passed
     */
    identify: ({ config, payload }) => {
      const mixpanel = resolveMixpanel(config);
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
    page: ({ config, payload }) => {
      const mixpanel = resolveMixpanel(config);
      mixpanel.track(payload.properties.path, {
        search: payload.properties.search,
      });
    },
    /* https://developer.mixpanel.com/docs/javascript-full-api-reference#mixpaneltrack */
    track: ({ config, payload }) => {
      const mixpanel = resolveMixpanel(config);
      mixpanel.track(payload.event, payload.properties);
    },
    loaded: () => {
      const mixpanel = resolveMixpanel(plugin.config);
      return !!mixpanel;
    },
    /* Clears super properties and generates a new random distinct_id for this instance. Useful for clearing data when a user logs out. */
    reset: ({ config }) => {
      const mixpanel = resolveMixpanel(config);
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
        const mixpanel = resolveMixpanel(pluginConfig);
        mixpanel.alias(alias, original);
      },
    },
  };
  return plugin;
}

export default mixpanelPlugin;
