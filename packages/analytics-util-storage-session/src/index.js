import { get, set, remove, undef } from '@analytics/global-storage-utils'

let isSupported = hasSessionStorage()

/**
 * Check if browser has access to LocalStorage
 * @returns {Boolean}
 */
function hasSessionStorage() {
  if (typeof isSupported !== undef) return isSupported
  isSupported = true
  try {
    sessionStorage.setItem(undef, undef)
    sessionStorage.removeItem(undef)
  } catch (e) {
    isSupported = false
  }
  return isSupported
}


/**
 * Get value from sessionStorage or fallback to global window
 * @param {string} key - Key of value to get
 * @returns {*} value
 */
function getSessionItem(key) {
  return isSupported ? sessionStorage.getItem(key) || undefined : get(key)
}

/**
 * Set value to sessionStorage or fallback to global window
 * @param {string} key - Key of value to set
 * @param {*} value 
 * @returns value
 */
function setSessionItem(key, value) {
  return isSupported ? sessionStorage.setItem(key, value) : set(key, value)
}

function removeSessionItem(key) {
  return isSupported ? sessionStorage.removeItem(key) : remove(key)
}

export {
  hasSessionStorage,
  getSessionItem,
  setSessionItem,
  removeSessionItem
}