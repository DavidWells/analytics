import { get, set, remove, hasSupport, wrap } from '@analytics/global-storage-utils'

const LOCAL_STORAGE = 'localStorage'

/**
 * Check if browser has access to LocalStorage
 * @returns {Boolean}
 */
const hasLocalStorage = hasSupport.bind(null, LOCAL_STORAGE)

/**
 * Get value from localStorage or fallback to global window
 * @param {string} key - Key of value to get
 * @returns {*} value
 */
const getItem = wrap(LOCAL_STORAGE, 'getItem', get)

/**
 * Set value to localStorage or fallback to global window
 * @param {string} key - Key of value to set
 * @param {*} value 
 * @returns value
 */
const setItem = wrap(LOCAL_STORAGE, 'setItem', set)

/**
 * Remove value from localStorage or fallback to global window
 * @param {string} key - Key of value to remove
 */
const removeItem = wrap(LOCAL_STORAGE, 'removeItem', remove)

export {
  LOCAL_STORAGE,
  hasLocalStorage,
  getItem,
  setItem,
  removeItem
}