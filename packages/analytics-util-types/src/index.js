
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
export const SYMBOL = 'symbol'
export const NULL = 'null'
export const ERROR = 'error'
export const TYPE_ERROR = 'typeError'
export const SYNTAX_ERROR = 'syntaxError'
export const ASYNC_FUNCTION = 'asyncFunction'
export const GENERATOR_FUNCTION = 'generatorFunction'
export const ASYNC_GENERATOR_FUNCTION = 'asyncGeneratorFunction'

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

/* Regex patterns */
export const REGEX_ISO = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/
export const REGEX_EMAIL = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
export const REGEX_JSON = /^\{[\s\S]*\}$|^\[[\s\S]*\]$/

/* ────────────────────
Environment checks
─────────────────────── */
/** @type {Object} */
const PROCESS = typeof process !== UNDEFINED ? process : {}

/** @type {String} */
export const ENV = (PROCESS.env && PROCESS.env.NODE_ENV) || ''

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

function text(method, s) {
  return s.charAt(0)[method]() + s.slice(1)
}

const upper = text.bind(null, 'toUpperCase')
const lower = text.bind(null, 'toLowerCase')

/**
 * Returns the object type of the given payload
 * @param {*} val
 * @returns {string}
 */
export function getTypeName(val) {
  if (isNull(val)) return upper(NULL)
  return (typeof val === OBJECT) ? ctorName(val) : Object.prototype.toString.call(val).slice(8, -1)
}

/**
 * Returns the object type of the given payload
 * @param {*} val
 * @returns {string}
 */
export function getType(val, toLowerCase = true) {
  const type = getTypeName(val)
  // console.log('type', type)
  return (toLowerCase) ? lower(type) : type
}

// export function getType(val) {
//   if (isNull(val)) return NULL
//   const type = typeof val
//   if (type === OBJECT) return ctorName(val).toLowerCase()
//   return type
// }

function typeOf(kind, val) {
  return typeof val === kind
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
 * Check if value is not undefined.
 * @param x
 * @return {x is undefined}
 */
export function isDefined(x) {
  return !isUndefined(x)
}

/** 
 * @param x
 * @return {x is boolean}
 */
export const isBoolean = typeOf.bind(null, BOOLEAN)

/** 
 * @param x
 * @return {x is symobl}
 */
export const isSymbol = typeOf.bind(null, SYMBOL)

/** 
 * @param x
 * @return {x is boolean}
 * @example
 * isNull(null)
 * // true
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
  return getType(n) === NUMBER && !isNaN(n)
}

export function isNumberLike(n) {
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
  return getType(x) === ARRAY
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

export function isObjectLike(obj) {
  return obj && (typeof obj === OBJECT || obj !== null)
}

/**
* Tests if a value is a parseable JSON string.
* @param {*} x - value to test
* @returns {boolean} boolean indicating if a value is a parseable JSON string
* @example
* isJson('{"a":5}') // returns true
* isJson('[]') // returns true
* isJson('{a":5}') // returns false
*/
export function isJson(x) {
  if (!isString(x) || !REGEX_JSON.test(x)) return false
  try {
    JSON.parse(x)
  } catch (e) { 
    return false
  }
  return true
}

/**
 * Is primative scalar value
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
  // if (isNaN(x)) return false
  switch (typeof x) {
    case STRING:
    case NUMBER:
    case SYMBOL:
    case UNDEFINED:
    case BOOLEAN:
      return true
    default:
      return false
  }
}

/**
* Tests if an object has a specified method name.
* @param {*} value - value to test
* @param {*} property - property to test
* @returns {boolean} boolean indicating if an object has a specified method name
* @example
* const obj = {
*   key: myFunc,
*   keyTwo: 'foobar'
* }
* isMethod(obj, 'key' ) // returns true
* isMethod(obj, 'keyTwo' ) // returns false
* isMethod(obj, 'otherThing' ) // returns false
*/
export function isMethod(value, prop) {
  return isObject(value) && isFunction(value[prop])
}

/**
 * Returns true if the input is a Promise.
 * @param {*} x - The input to test
 * @returns {boolean}
 */
export function isPromise(x) {
  if (!x) return false
  return !!(!isUndefined(Promise) && x instanceof Promise || x.then && isFunction(x.then))
}

/**
 * Returns true if the input is a generator.
 * @param {*} x - The input to test
 * @returns {boolean}
 */
export function isGenerator(x) {
  return isObjectLike(x) && isFunction(x.throw) && isFunction(x.return) && isFunction(x.next)
}

/** 
 * Is generator function
 * @param x
 * @return {boolean}
 * @example
   isGeneratorFunction(() => {}) =>  false
   isGeneratorFunction(function* () => {}) =>  true
   isGeneratorFunction(function * () {
     yield 'my-val'
   }))
 */
export function isGeneratorFunction(x) {
  return getType(x) === GENERATOR_FUNCTION
}

/** 
 * Is async function
 * @param x
 * @return {boolean}
 * @example
   isAsyncFunction(() => {}) =>  false
   isAsyncFunction(async () => {}) =>  true
 */
export function isAsyncFunction(x) {
  return getType(x) === ASYNC_FUNCTION
}


export function ctorName(x) {
  return isFunction(x.constructor) ? x.constructor.name : null
}

/**
 * Returns true if the input is a Set.
 * @param {*} x - The input to test
 * @returns {boolean}
 */
export function isSet(value) {
  return value instanceof Set
}

/**
 * Returns true if the input is a Map.
 * @param {*} x - The input to test
 * @returns {boolean}
 */
export function isMap(value) {
  return value instanceof Map
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
 * Check if value is Buffer
 * @param {*} value - Value to check
 * @return {boolean} 
 */
export function isBuffer(val) {
  if (val.constructor && isFunction(val.constructor.isBuffer)) {
    return val.constructor.isBuffer(val)
  }
  return false
}

/**
 * Check if value is Error
 * @param x - Object to check
 * @return {Boolean} If value is error
 * @example
 * isError(new Error()) // True
 */
export function isError(x) {
  return x instanceof Error || (isString(x.message) && x.constructor && isNumber(x.constructor.stackTraceLimit))
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

function errorType(ErrKind, value) {
  if (typeof value !== 'object' || isNull(value)) return false
  // Check for `TypeError` objects from the same realm (same Node.js `vm` or same `Window` object)...
  if (value instanceof ErrKind) return true
  const typeName = getType(new ErrKind(''))
  // All `TypeError` objects are `Error` objects...
  if (isError(value)) {
    while (value) {
      if (getType(value) === typeName) {
        return true
      }
        value = Object.getPrototypeOf(value)
    }
  }
  return false
}

export const isTypeError = errorType.bind(null, TypeError)

export const isSyntaxError = errorType.bind(null, SyntaxError)

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
 * Check if value is function arguments
 * @param {*} val 
 * @returns 
 */
export function isArguments(val) {
  try {
    if (isNumber(val.length) && isFunction(val.callee)) return true
  } catch (err) {
    if (err.message.indexOf('callee') !== -1) return true
  }
  return false
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
 * Check if value is falsy
 * @param {*} x 
 * @return {Boolean} - is falsy value
 * @example
 * isFalsy(false) // returns true
 * isFalsy(null) // returns true
 * isFalsy('') // returns true
 * isFalsy(0) // returns true
 * isFalsy(void 0) // returns true
 * isFalsy(NaN) // returns true
 * isFalsy([]) // returns false
 */
export function isFalsy(x) {
  return x ? false : true
}

// ^ future updates https://github.com/thenativeweb/boolean

/**
 * Check if value is true
 * @param {*} x 
 * @return {Boolean} - is true
 */
export function isTrue(x) {
  return x === true
}

/**
 * Check if value is true
 * @param {*} x 
 * @return {Boolean} - is true
 */
export function isFalse(x) {
  return x === false
}

/**
 * Check if value is email
 * @param {*} x 
 * @return {Boolean} - is email like value
 */
export function isEmail(x) {
  if (x.length > 320) return false
  return REGEX_EMAIL.test(x)
}

/**
 * Check if valie is date
 * @param {*} val 
 * @returns {Boolean}
 */
export function isDate(x) {
  if (x instanceof Date) return true
  return isFunction(x.toDateString) && isFunction(x.getDate) && isFunction(x.setDate)
}

/**
 * Check if value is ISO date e.g. '2022-01-02T06:45:28.547Z'
 * @param {*} x
 * @return {Boolean} - is email like value
 */
export function isIsoDate(x) {
  return REGEX_ISO.test(x)
}

/**
 * Is value empty
 * @param {*} x 
 * @returns {Boolean}
 * @example
 * isEmpty(null)
 *
 * isEmpty([1, 2, 3])
 * // => false
 *
 * isEmpty('abc')
 * // => false
 *
 * isEmpty({ 'a': 1 })
 * // => false
 */
export function isEmpty(x) {
  if (isNull(x)) return true
  if (isArray(x)) return !x.length
  if (isSet(x) || isMap(x)) return !x.size
  if (isObject(x)) return !Object.keys(x).length
  return true
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

/* ────────────────────
Ensure Values
─────────────────────── */

/**
 * Ensure value returned is Array
 * @param {*} singleOrArray 
 * @returns [*]
 */
export function ensureArray(singleOrArray) {
  if (!singleOrArray) return []
  if (isArray(singleOrArray)) return singleOrArray
  return [singleOrArray]
}