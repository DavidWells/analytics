
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
export const NONE = 'none'
export const HIDDEN = 'hidden'
export const PREFIX = '__'

/* DOM Constants */
export const FORM = 'form'
export const INPUT = 'input'
export const BUTTON = 'button'
export const SELECT = 'select'
export const CHANGE = 'change'
export const SUBMIT = 'submit'

/* ────────────────────
Environment checks
─────────────────────── */
/** @type {Object} */
const PROCESS = typeof process !== UNDEFINED ? process : {}

/** @type {String} */
export const ENV = PROCESS.env?.NODE_ENV || ''

/** @type {Boolean} */
export const isProd = ENV === 'production'

/** @type {Boolean} */
export const isStaging = ENV === 'staging'

/** @type {Boolean} */
export const isDev = ENV === 'development'

/** @type {Boolean} */
export const isBrowser = typeof window !== UNDEFINED
/** @type {Boolean} */
export const isLocalHost = isBrowser && window.location.hostname === 'localhost'

/** @type {Boolean} */
export const isNode = PROCESS.versions != null && PROCESS.versions.node != null

/** @type {Boolean} */
export const isDeno = typeof Deno !== UNDEFINED && typeof Deno.core !== UNDEFINED;

/** @type {Boolean} */
export const isWebWorker = typeof self === OBJECT && self.constructor && self.constructor.name === 'DedicatedWorkerGlobalScope'

/** @type {Boolean} */
export const isJsDom = (isBrowser && window.name === 'nodejs') || (typeof navigator !== UNDEFINED && (navigator.userAgent.includes('Node.js') || navigator.userAgent.includes('jsdom')))

/* ────────────────────
Type checks
─────────────────────── */

export function typeOf(type, val) {
  return typeof val === type
}

/** 
 * Check if value is function.
 * @param x
 * @return {x is Function}
 */
export const isFunction = typeOf.bind(null, FUNCTION)

/** 
 * Check if value is string.
 * @param x
 * @return {x is string}
 */
export const isString = typeOf.bind(null, STRING)

/** 
 * Check if value is undefined.
 * @param x
 * @return {x is undefined}
 */
export const isUndefined = typeOf.bind(null, UNDEFINED)

/** 
 * @param x
 * @return {x is boolean}
 */
export const isBoolean = typeOf.bind(null, BOOLEAN)

/** 
 * @param x
 * @return {x is boolean}
 */
export function isNull(x) {
  return x === null
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
 * @template T
 * @param x
 * @return {x is Array<T>}
 */
export function isArray(x) {
  return Object.prototype.toString.call(x) === '[object Array]'
}

export function isObjectLike(obj) {
  return obj && (typeof obj === OBJECT || obj !== null)
}

/** 
 * @param obj
 * @return {obj is Object}
 */
export function isObject(obj) {
  if (!isObjectLike(obj)) return false

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
export function isPrimitive(x) {
  if (isNull(x)) return true
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
 * Check if value error like (i.e has the name and message properties, both of which are strings)
 * @param obj - Object to check
 * @return {Boolean} If object is error-like
 * via https://github.com/Luke-zhang-04/utils/blob/master/src/typeGuards.ts#L62
 * @example
 *
 * ```js
 * isErrorLike(new Error()) // True
 * isErrorLike({name: "Error!", message: "This is an error", other: 0}) // True
 * isErrorLike({}) // False
 * isErrorLike({name: "Error", message: null}) // False
 *
 * // Works as a typguard
 * const something = {name: "Error", message: "This is an error"} as unknown
 *
 * if (isErrorLike(something)) {
 *   console.log(something.name) // No Typescript error
 * }
 * ```
 */
export function isErrorLike(obj) {
  return isObjectLike(obj) && isString(obj.message) && isString(obj.name)
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
  const noOpStr = noOp + ''
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

/**
 * Check if value is ISO date e.g. '2022-01-02T06:45:28.547Z'
 * @param {*} str
 * @return {Boolean} - is email like value
 */
export function isIsoDate(str) {
  return /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/.test(str)
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
export function isElement(element, type) {
  const isEl = element instanceof Element || element instanceof HTMLDocument
  if (!isEl || !type) return isEl
  return isNodeType(element, type)
}

/**
 * Check if element is specific DOMNode type
 * @param {HTMLElement|*} element
 * @param {String} type
 * @return {boolean}
 */
export function isNodeType(element, type = '') {
  return element && element.nodeName === type.toUpperCase()
}

function bindArgs(fn, ...boundArgs) {
  return function(...args) {
    return fn(...args, ...boundArgs)
  }
}

/**
 * Check if element is form element
 * @param {HTMLElement} element
 * @return {boolean} 
 */
export const isForm = bindArgs(isElement, FORM)

/**
 * Check if element is button element
 * @param {HTMLElement} element
 * @return {boolean} 
 */
export const isButton = bindArgs(isElement, BUTTON)

/**
 * Check if element is input element
 * @param {HTMLElement} element
 * @return {boolean} 
 */
export const isInput = bindArgs(isElement, INPUT)

/**
 * Check if element is select element
 * @param {HTMLElement} element
 * @return {boolean} 
 */
export const isSelect = bindArgs(isElement, SELECT)

/**
 * Check if DOM element is hidden
 * @param {HTMLElement|null|undefined} element
 * @param {HTMLElement|null|undefined} until
 * @return {boolean}
 */
export function isHidden(element, until) {
  if (!element || getComputedStyle(element).visibility === HIDDEN) return true

  while (element) {
    if (until != null && element === until) return false
    if (getComputedStyle(element).display === NONE) return true
    element = element.parentElement
  }

  return false
}