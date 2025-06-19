/**
 * @fileoverview TypeScript type definitions for Analytics Core using JSDoc
 */

/**
 * Configuration for initializing the analytics instance
 * @typedef {Object} AnalyticsInstanceConfig
 * @property {string} [app] - Name of site / app
 * @property {string|number} [version] - Version of your app
 * @property {boolean} [debug] - Should analytics run in debug mode
 * @property {AnalyticsPlugin[]} [plugins] - Array of analytics plugins
 * @property {Object} [storage] - Custom storage implementation
 * @property {Function} [storage.getItem] - Function to get storage item
 * @property {Function} [storage.setItem] - Function to set storage item
 * @property {Function} [storage.removeItem] - Function to remove storage item
 * @property {Object} [reducers] - Custom reducers for state management
 * @property {Object} [initialUser] - Initial user data
 */

/**
 * Analytics plugin definition
 * @typedef {Object} AnalyticsPlugin
 * @property {string} name - Name of plugin
 * @property {Object} [EVENTS] - Exposed events of plugin
 * @property {Object} [config] - Configuration of plugin
 * @property {boolean} [enabled] - Whether plugin is enabled
 * @property {Function} [initialize] - Load analytics scripts method
 * @property {Function} [page] - Page visit tracking method
 * @property {Function} [track] - Custom event tracking method
 * @property {Function} [identify] - User identify method
 * @property {Function} [loaded] - Function to determine if analytics script loaded
 * @property {Function} [ready] - Fire function when plugin ready
 * @property {Object} [methods] - Custom methods exposed by plugin
 */

/**
 * User data structure
 * @typedef {Object} UserData
 * @property {string} [id] - User ID
 * @property {string} [userId] - User ID (alias)
 * @property {string} anonymousId - Anonymous ID
 * @property {Object} [traits] - User traits/properties
 */

/**
 * Page data structure
 * @typedef {Object} PageData
 * @property {string} [title] - Page title
 * @property {string} [url] - Page URL
 * @property {string} [path] - Page path
 * @property {string} [referrer] - Page referrer
 * @property {string} [search] - URL search parameters
 * @property {string} [hash] - URL hash
 * @property {number} [width] - Screen width
 * @property {number} [height] - Screen height
 */

/**
 * Event payload for tracking
 * @typedef {Object} TrackPayload
 * @property {string} event - Event name
 * @property {Object} [properties] - Event properties
 * @property {Object} [options] - Event options
 * @property {Object} [context] - Event context
 */

/**
 * Identify payload for user identification
 * @typedef {Object} IdentifyPayload
 * @property {string} [userId] - User ID
 * @property {Object} [traits] - User traits
 * @property {Object} [options] - Identify options
 * @property {Object} [context] - Identify context
 */

/**
 * Page payload for page tracking
 * @typedef {Object} PagePayload
 * @property {string} [name] - Page name
 * @property {Object} [properties] - Page properties
 * @property {Object} [options] - Page options
 * @property {Object} [context] - Page context
 */

/**
 * Storage interface
 * @typedef {Object} StorageInterface
 * @property {Function} getItem - Get item from storage
 * @property {Function} setItem - Set item in storage
 * @property {Function} removeItem - Remove item from storage
 */

/**
 * Plugin management interface
 * @typedef {Object} PluginsInterface
 * @property {Function} enable - Enable plugin(s)
 * @property {Function} disable - Disable plugin(s)
 */

/**
 * Main Analytics instance
 * @typedef {Object} AnalyticsInstance
 * @property {Function} identify - Identify a user
 * @property {Function} track - Track an analytics event
 * @property {Function} page - Trigger page view
 * @property {Function} user - Get user data
 * @property {Function} reset - Clear information about user & reset analytics
 * @property {Function} ready - Fire callback on analytics ready event
 * @property {Function} on - Fire callback on analytics lifecycle events
 * @property {Function} once - Fire callback on analytics lifecycle events once
 * @property {Function} getState - Get data about user, activity, or context
 * @property {StorageInterface} storage - Storage methods
 * @property {PluginsInterface} plugins - Plugin methods
 */

/**
 * Callback function type
 * @typedef {Function} Callback
 * @param {...*} args - Callback arguments
 */

/**
 * Event listener function
 * @typedef {Function} EventListener
 * @param {Object} payload - Event payload
 */

/**
 * Detach listeners function
 * @typedef {Function} DetachListeners
 * @returns {void}
 */