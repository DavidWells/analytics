
/*
  Constants for reuse
*/
export const FUNCTION = 'function'
export const STRING = 'string'
export const UNDEFINED = 'undefined'
export const BOOLEAN = 'boolean'
export const OBJECT = 'object'

/** 
 * @param x
 * @return {x is Function}
 */
export function isFunction(x) {
  return typeof x === FUNCTION
}

/** 
 * @param x
 * @return {x is string}
 */
export function isString(x) {
  return typeof x === STRING
}

/** 
 * @param x
 * @return {x is undefined}
 */
export function isUndefined(x) {
  return typeof x === UNDEFINED
}

/** 
 * @param x
 * @return {x is boolean}
 */
export function isBoolean(x) {
  return typeof x === BOOLEAN
}

/** 
 * @template T
 * @param x
 * @return {x is Array<T>}
 */
export function isArray(x) {
  return Array.isArray(x)
}

/** 
 * @param obj
 * @return {obj is Object}
 */
export function isObject(obj) {
  if (typeof obj !== OBJECT || obj === null) return false

  let proto = obj
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto)
  }

  return Object.getPrototypeOf(obj) === proto
}