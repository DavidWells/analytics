
/*
  Constants for reuse
*/
export const FUNCTION = 'function'
export const STRING = 'string'
export const UNDEFINED = 'undefined'
export const BOOLEAN = 'boolean'
export const OBJECT = 'object'
export const ARRAY = 'array'
export const NUMBER = 'number'
export const noOp = () => {}

export const isBrowser = typeof window !== UNDEFINED

/** 
 * Check if value is function.
 * @param x
 * @return {x is Function}
 */
export function isFunction(x) {
  return typeof x === FUNCTION
}

/** 
 * Check if value is string.
 * @param x
 * @return {x is string}
 */
export function isString(x) {
  return typeof x === STRING
}

/** 
 * Check if value is number.
 * @param v
 * @return {v is Object}
 */
export function isNumber(v) {
  return typeof v === NUMBER && !isNaN(v)
}

/** 
 * Check if value is undefined.
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
 * Check if input is DOM element
 * @param {HTMLElement|*} element
 * @return {boolean} 
 */
export function isElement(element) {
  return element instanceof Element || element instanceof HTMLDocument
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
 * Check if DOM element is hidden
 * @param {HTMLElement|null|undefined} element
 * @param {HTMLElement|null|undefined} until 
 * @return {boolean} 
 */
export function isHidden(element, until) {
  if (!element || getComputedStyle(element).visibility === "hidden") return true

  while (element) {
    if (until != null && element === until) return false
    if (getComputedStyle(element).display === "none") return true
    element = element.parentElement
  }

  return false
}