const globalContext =
  (typeof self === 'object' && self.self === self && self) ||
  (typeof global === 'object' && global.global === global && global) ||
  this

/**
 * Get value from global context
 * @param {string} key - Key of value to get
 * @returns {*} value
 */
function get(key) {
  return globalContext[key]
}

/**
 * Set value to global context
 * @param {string} key - Key of value to set
 * @param {*} value 
 * @returns value
 */
function set(key, value) {
  globalContext[key] = value
  return value
}

/**
 * Remove value to global context
 * @param {string} key - Key of value to remove
 */
function remove(key) {
  set(key, undefined)
}

export {
  get,
  set,
  remove,
  globalContext,
}
