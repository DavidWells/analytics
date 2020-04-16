export function isFunction(x) {
  return typeof x === 'function'
}

export function isString(x) {
  return typeof x === 'string'
}

export function isUndefined(x) {
  return typeof x === 'undefined'
}

export function isBoolean(x) {
  return typeof x === 'boolean'
}

export function isObject(obj) {
  if (typeof obj !== 'object' || obj === null) return false

  let proto = obj
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto)
  }

  return Object.getPrototypeOf(obj) === proto
}
