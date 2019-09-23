/**
 * Core Analytic constants. These are exposed for third party plugins & listeners
 * @typedef {Object} constants
 * @property {ANON_ID} ANON_ID - Anonymous visitor Id localstorage key
 * @property {USER_ID} USER_ID - Visitor Id localstorage key
 * @property {USER_TRAITS} USER_TRAITS - Visitor traits localstorage key
 */

/**
 * Anonymous visitor Id localstorage key
 * @typedef {String} ANON_ID
 */
export const ANON_ID = '__anon_id'
/**
 * Visitor Id localstorage key
 * @typedef {String} USER_ID
 */
export const USER_ID = '__user_id'
/**
 * Visitor traits localstorage key
 * @typedef {String} USER_TRAITS
 */
export const USER_TRAITS = '__user_traits'
