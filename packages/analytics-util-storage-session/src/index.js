import { get, set, remove, hasSupport, wrap } from '@analytics/global-storage-utils'

const SESSION_STORAGE = 'sessionStorage'

/**
 * Check if browser has access to sessionStorage
 * @returns {Boolean}
 */
const hasSessionStorage = hasSupport.bind(null, SESSION_STORAGE)

/**
 * Get value from sessionStorage or fallback to global window
 * @param {string} key - Key of value to get
 * @returns {*} value
 */
const getSessionItem = wrap(SESSION_STORAGE, 'getItem', get)

/**
 * Set value to sessionStorage or fallback to global window
 * @param {string} key - Key of value to set
 * @param {*} value 
 * @returns value
 */
const setSessionItem = wrap(SESSION_STORAGE, 'setItem', set)

/**
 * Remove value from sessionStorage or fallback to global window
 * @param {string} key - Key of value to remove
 */
const removeSessionItem = wrap(SESSION_STORAGE, 'removeItem', remove)

export {
  SESSION_STORAGE,
  hasSessionStorage,
  getSessionItem,
  setSessionItem,
  removeSessionItem
}