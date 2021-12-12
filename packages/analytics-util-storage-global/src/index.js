export const GLOBAL = 'global'

export const undef = 'undefined'

export const globalContext =
  (typeof self === 'object' && self.self === self && self) ||
  (typeof global === 'object' && global.global === global && global) ||
  this

/**
 * Get value from global context
 * @param {string} key - Key of value to get
 * @returns {*} value
 */
export function get(key) {
  return globalContext[key]
}

/**
 * Set value to global context
 * @param {string} key - Key of value to set
 * @param {*} value 
 * @returns value
 */
export function set(key, value) {
  globalContext[key] = value
  return value
}

/**
 * Remove value to global context
 * @param {string} key - Key of value to remove
 */
export function remove(key) {
  set(key)
}

/*
// () => localStorage)
// () => sessionStorage)
export function isSupported(getStorage) {
  try {
    const testKey = '__' + undef
    getStorage().setItem(testKey, testKey)
    getStorage().removeItem(testKey)
    return true
  } catch (e) {
    return false
  }
}
*/