
/*
  Constants for reuse
*/
export const FUNCTION = 'function'
export const STRING = 'string'
export const UNDEFINED = 'undefined'
export const BOOLEAN = 'boolean'
export const OBJECT = 'object'
export const ARRAY = 'array'
export const noOp = () => {}

export const isBrowser = typeof window !== UNDEFINED

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
  return Object.prototype.toString.call(x) === '[object Array]'
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


/**
 * Check if value is regexp
 * @param {*} value - Value to check
 * @return {boolean} 
 */
export function isRegex(value) {
  return value instanceof RegExp
}

/** 
 * @param func - function to check if noOp
 * @return {Boolean} - is noOp
 * @examples
   function foo() {}
   isNoOp(foo) // true
   isNoOp(() => { }) // true
   isNoOp(() => { console.log('hi') }) // false
 */
export function isNoOp(func) {
  if (!isFunction(func)) return false
  const emptyFunc = /{(\r|\n|\s)*}/gm
  const noOpStr = noOp.toString()
  const funcString = (func.toString().match(emptyFunc) || [''])[0].replace(emptyFunc, noOpStr)
  return noOpStr === funcString
}

/** 
 * @param obj
 * @return {obj is NodeList}
 */
export function isNodeList(obj) {
  return NodeList.prototype.isPrototypeOf(obj)
}

/**
 * Check if element is form element
 * @param {HTMLElement} element
 * @return {boolean} 
 */
export function isForm(element) {
  return isElement(element) && element.nodeName === 'FORM'
}

/**
 * Check if element is form element
 * @param {HTMLElement|*} element
 * @return {boolean} 
 */
export function isElement(element) {
  return element instanceof Element || element instanceof HTMLDocument
}