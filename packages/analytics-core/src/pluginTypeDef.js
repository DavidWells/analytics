/**
  * @typedef {Object} AnalyticsPlugin
  * @property {string} name - Name of plugin
  * @property {Object} [EVENTS] - exposed events of plugin
  * @property {Object} [config] - Configuration of plugin
  * @property {function} [initialize] - Load analytics scripts method
  * @property {function} [page] - Page visit tracking method
  * @property {function} [track] - Custom event tracking method
  * @property {function} [identify] - User identify method
  * @property {function} [loaded] - Function to determine if analytics script loaded
  * @property {function} [ready] - Fire function when plugin ready
  */
