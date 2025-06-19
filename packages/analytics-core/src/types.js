/**
 * @fileoverview TypeScript type definitions for Analytics Core using JSDoc
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