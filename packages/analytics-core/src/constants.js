/**
 * Core Analytic constants. These are exposed for third party plugins & listeners
 */
import { PREFIX } from '@analytics/type-utils'

/**
 * Anonymous visitor Id localstorage key
 * @type {string}
 */
export const ANON_ID = PREFIX + 'anon_id' // __anon_id

/**
 * Visitor Id localstorage key  
 * @type {string}
 */
export const USER_ID = PREFIX + 'user_id' // __user_id

/**
 * Visitor traits localstorage key
 * @type {string}
 */
export const USER_TRAITS = PREFIX + 'user_traits' // __user_traits

/**
 * Core Analytic constants. These are exposed for third party plugins & listeners
 * @typedef {Object} constants
 * @property {ANON_ID} ANON_ID - Anonymous visitor Id localstorage key
 * @property {USER_ID} USER_ID - Visitor Id localstorage key
 * @property {USER_TRAITS} USER_TRAITS - Visitor traits localstorage key
 */
