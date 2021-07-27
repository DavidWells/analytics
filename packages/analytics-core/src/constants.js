/**
 * Core Analytic constants. These are exposed for third party plugins & listeners
 * @typedef {Object} constants
 * @property {ANON_ID} ANON_ID - Anonymous visitor Id localstorage key
 * @property {USER_ID} USER_ID - Visitor Id localstorage key
 * @property {USER_TRAITS} USER_TRAITS - Visitor traits localstorage key
 */
import { PREFIX } from './utils/internalConstants'

/**
 * Anonymous visitor Id localstorage key
 * @typedef {String} ANON_ID
 */
export const ANON_ID = PREFIX + 'anon_id' // __anon_id
/**
 * Visitor Id localstorage key
 * @typedef {String} USER_ID
 */
export const USER_ID = PREFIX + 'user_id' // __user_id
/**
 * Visitor traits localstorage key
 * @typedef {String} USER_TRAITS
 */
export const USER_TRAITS = PREFIX + 'user_traits' // __user_traits
