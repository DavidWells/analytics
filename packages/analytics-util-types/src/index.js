
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
export const ANY = 'any'
export const ALL = '*'

/* ────────────────────
Environment checks
─────────────────────── */

/** @type {Boolean} */
export const isBrowser = typeof window !== UNDEFINED

/** @type {Boolean} */
export const isNode = typeof process !== UNDEFINED && process.versions != null && process.versions.node != null

/** @type {Boolean} */
export const isDeno = typeof Deno !== UNDEFINED && typeof Deno.core !== UNDEFINED;

/** @type {Boolean} */
export const isWebWorker = typeof self === OBJECT && self.constructor && self.constructor.name === 'DedicatedWorkerGlobalScope'

/** @type {Boolean} */
export const isJsDom = (isBrowser && window.name === 'nodejs') || (typeof navigator !== UNDEFINED && (navigator.userAgent.includes('Node.js') || navigator.userAgent.includes('jsdom')))

/* ────────────────────
Type checks
─────────────────────── */

/** 
 * Check if value is function.
 * @param x
 * @return {x is Function}
 */
export function isFunction(x) {
  return typeof x === FUNCTION
}

/** 
 * Check if value is ES2015 `class`.
 * @param x
 * @return {x is Class}
 */
export function isClass(x) {
  if (isFunction(x)) {
    return /^class /.test(Function.prototype.toString.call(x))
  }
  return false
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
 * @param n
 * @return {boolean}
 * @example
 * > isNumber(0)
 * true
 * > isNumber(1)
 * true
 * > isNumber(1.1)
 * true
 * > isNumber(0xff)
 * true
 * > isNumber(0644)
 * true
 * > isNumber(6.2e5)
 * true
 * > isNumber(NaN)
 * false
 * > isNumber(Infinity)
 * true
 */
export function isNumber(n) {
  return !isNaN(parseFloat(n))
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
 * @param x
 * @return {x is boolean}
 */
export function isNull(x) {
  return x === null
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
 * Is primative value
 * @param x
 * @return {boolean}
 * @example
   isPrimitive(true) =>  true
   isPrimitive({}) => false
   isPrimitive(0) =>  true
   isPrimitive('1') =>  true
   isPrimitive(1.1) =>  true
   isPrimitive(NaN) =>  true
   isPrimitive(Infinity) =>  true
   isPrimitive(function() {}) => false
   isPrimitive(Date), => false
   isPrimitive(null) =>  true
   isPrimitive(undefined) =>  true
 */
export function isPrimitive (x) {
  if (x === null) return true
  switch (typeof x) {
    case STRING:
    case NUMBER:
    case 'symbol':
    case UNDEFINED:
    case BOOLEAN:
      return true
    default:
      return false
  }
}

/**
 * Returns true if the input is a Promise.
 * @param {*} input - The input to test
 * @returns {boolean}
 * @static
 */
export function isPromise(x) {
  if (!x) return false
  return !!(!isUndefined(Promise) && x instanceof Promise || x.then && isFunction(x.then))
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
 * Check if value is truthy
 * @param {*} value 
 * @return {Boolean} - is truthy value
 */
export function isTruthy(v) {
  if (isString(v) && v.toLowerCase() === 'false') return false
  return !!v
}

/**
 * Check if value is email
 * @param {*} str 
 * @return {Boolean} - is email like value
 */
export function isEmail(str) {
  if (str.length > 320) return false
  return /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(str)
}

/* ────────────────────
HTML Element checks
─────────────────────── */

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
  if (!element || getComputedStyle(element).visibility === 'hidden') return true

  while (element) {
    if (until != null && element === until) return false
    if (getComputedStyle(element).display === 'none') return true
    element = element.parentElement
  }

  return false
}