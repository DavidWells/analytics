import { get, set, remove, undef } from '@analytics/global-storage-utils'

let isSupported = hasLocalStorage()

/**
 * Check if browser has access to LocalStorage
 * @returns {Boolean}
 */
function hasLocalStorage() {
  if (typeof isSupported !== undef) return isSupported
  isSupported = true
  try {
    if (typeof localStorage === undef || typeof JSON === undef) {
      isSupported = false
    }
    // test for safari private
    localStorage.setItem(undef, undef)
    localStorage.removeItem(undef)
  } catch (err) {
    isSupported = false
  }
  return isSupported
}

/**
 * Get value from localStorage or fallback to global window
 * @param {string} key - Key of value to get
 * @returns {*} value
 */
function getItem(key) {
  return isSupported ? localStorage.getItem(key) : get(key)
}

/**
 * Set value to localStorage or fallback to global window
 * @param {string} key - Key of value to set
 * @param {*} value 
 * @returns value
 */
function setItem(key, value) {
  return isSupported ? localStorage.setItem(key, value) : set(key, value)
}

/**
 * Remove value from localStorage or fallback to global window
 * @param {string} key - Key of value to remove
 */
function removeItem(key) {
  return isSupported ? localStorage.removeItem(key) : remove(key)
}

export {
  hasLocalStorage,
  getItem,
  setItem,
  removeItem
}