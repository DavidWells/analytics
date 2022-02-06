import { OBJECT, PREFIX, UNDEFINED } from '@analytics/type-utils'

export const GLOBAL = 'global'

export const KEY = PREFIX + GLOBAL + PREFIX

export const globalContext = (typeof self === OBJECT && self.self === self && self) || (typeof global === OBJECT && global[GLOBAL] === global && global) || this

/* initialize global object */
if (!globalContext[KEY]) {
  globalContext[KEY] = {}
}
/**
 * Get value from global context
 * @param {string} key - Key of value to get
 * @returns {*} value
 */
export function get(key) {
  return globalContext[KEY][key]
}

/**
 * Set value to global context
 * @param {string} key - Key of value to set
 * @param {*} value 
 * @returns value
 */
export function set(key, value) {
  return globalContext[KEY][key] = value
}

/**
 * Remove value to global context
 * @param {string} key - Key of value to remove
 */
export function remove(key) {
  delete globalContext[KEY][key]
}

/**
 * Wrap localStorage & session storage checks
 * @param {string} type - localStorage or sessionStorage
 * @param {string} storageOperation - getItem, setItem, removeItem
 * @param {function} fallbackFunction - fallback function
 */
export function wrap(type, operation, fallback) {
  let fn
  try {
    if (hasSupport(type)) {
      const storage = window[type]
      fn = storage[operation].bind(storage)
    }
  } catch(e) {}
  return fn || fallback
}

const cache = {}
export function hasSupport(type) {
  if (typeof cache[type] !== UNDEFINED) {
    return cache[type]
  }
  try {
    const storage = window[type]
    // test for private safari
    storage.setItem(UNDEFINED, UNDEFINED)
    storage.removeItem(UNDEFINED)
  } catch (err) {
    return cache[type] = false
  }
  return cache[type] = true
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
