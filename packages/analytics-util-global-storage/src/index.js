const globalContext =
  (typeof self === 'object' && self.self === self && self) ||
  (typeof global === 'object' && global.global === global && global) ||
  this

function get(key) {
  return globalContext[key]
}

function set(key, value) {
  globalContext[key] = value
  return value
}

function remove(key) {
  set(key, undefined)
}

export {
  globalContext,
  get,
  set,
  remove
}
