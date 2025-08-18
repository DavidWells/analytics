/**
 * @callback PluginTrackFunction
 * @param {Object} arg
 * @param {Object} arg.config config from the plugin spec
 * @param {AnalyticsInstance} arg.instance analytics instance
 * @param {Object} arg.payload event data
 * @param {string} arg.payload.event event name passed to track
 * @param {Object.<string,Object>} arg.payload.properties event properties passed to track
 * @return {void}
 */

/**
 * @callback PluginPageFunction
 * @param {Object} arg
 * @param {Object} arg.config config from the plugin spec
 * @param {AnalyticsInstance} arg.instance analytics instance
 * @param {Object} arg.payload
 * @param {string} arg.payload.event
 * @param {PageData} arg.payload.properties
 * @return {void}
 */

/**
 * @callback PluginIdentifyFunction
 * @param {Object} arg
 * @param {Object} arg.config config from the plugin spec
 * @param {AnalyticsInstance} arg.instance analytics instance
 * @param {Object} arg.payload
 * @param {string} arg.payload.userId
 * @param {Object.<string,Object>} arg.payload.traits
 * @return {void}
 */

/**
 * @callback PluginInitializeFunction
 * @param {Object} arg
 * @param {Object} arg.config config from the plugin spec
 * @param {AnalyticsInstance} arg.instance analytics instance
 * @return boolean
 */

/**
 * @callback PluginLoadedFunction
 * @param {Object} arg
 * @param {Object} arg.config config from the plugin spec
 * @param {AnalyticsInstance} arg.instance analytics instance
 * @param {Object} arg.payload
 * @return boolean
 */

/**
 * @callback PluginReadyFunction
 * @param {Object} arg
 * @param {Object} arg.config config from the plugin spec
 * @param {AnalyticsInstance} arg.instance analytics instance
 * @return void
 */

/**
  * @typedef {Object} AnalyticsPlugin
  * @property {string} name - Name of plugin
  * @property {Object} [EVENTS] - exposed events of plugin
  * @property {Object} [config] - Configuration of plugin
  * @property {function} [initialize] - Load analytics scripts method
  * @property {PluginPageFunction} [page] - Page visit tracking method
  * @property {PluginTrackFunction} [track] - Custom event tracking method
  * @property {PluginIdentifyFunction} [identify] - User identify method
  * @property {PluginLoadedFunction} [loaded] - Function to determine if analytics script loaded
  * @property {PluginReadyFunction} [ready] - Fire function when plugin ready
  */
