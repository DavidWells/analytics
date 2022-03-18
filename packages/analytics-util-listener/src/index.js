import { isBrowser, isString, isFunction, ensureArray, noOp } from '@analytics/type-utils'

const EVENT = 'Event'
const EventListener = EVENT + 'Listener'

function createListener(add) {
  return (els, evts, callback, opts) => {
    const handler = callback || noOp
    /* SSR support */
    if (!isBrowser) return handler
    
    const options = opts || false
    const events = toArray(evts)
    const elements = toArray(els, true)
    let fns = []
    /* Throw if no element found */
    if (!elements.length) throw new Error('noElements')
    /* Throw if no events found */
    if (!events.length) throw new Error('no' + EVENT)
  
    function smartAttach(isAdd) {
      const method = (isAdd) ? 'add' + EventListener : 'remove' + EventListener
      // console.log((isAdd) ? '>> setup called' : '>> teardown')
      // console.log(`>>> with ${method}`)
      if (isAdd) fns = []
      
      // Apply to all elements
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i]
        fns[i] = (isAdd ? oncify(handler, options) : fns[i] || handler)
        // Apply to all events
        for (let n = 0; n < events.length; n++) {
          if (el[method]) {
            el[method](events[n], fns[i], options)
          } else {
            /* Fallback for older browsers IE <=8 */
            el['on' + events[n]] = (isAdd) ? fns[i] : null
          }
        }
      }
      // return opposite function with inverse event handler
      return smartAttach.bind(null, !isAdd)
    }

    return smartAttach(add)
  }
}

function toArray(obj, isSelector) {
  // Split string
  if (isString(obj)) {
    return isSelector ? toArray(document.querySelectorAll(obj)) : obj.split(' ').map(e => e.trim())
  }
  // Convert NodeList to Array
  if (NodeList.prototype.isPrototypeOf(obj)) {
    const array = []
    for (var i = obj.length >>> 0; i--;) { // iterate backwards ensuring that length is an UInt32
      array[i] = obj[i]
    }
    return array
  }
  // Is Array, return it OR Convert single element to Array
  // return isArray(obj) ? obj : [ obj ]
  return ensureArray(obj)
}

function oncify(handler, opts) {
  return (opts && opts.once) ? once(handler) : handler
}


/**
 * Run function once
 * @param {Function} fn - Function to run just once
 * @param {*} [context] - Extend function context
 * @returns 
 */
export function once(fn, context) {
  var result
  return function() {
    if (fn) {
      result = fn.apply(context || this, arguments)
      fn = null
    }
    return result
  }
}

/**
 * Element selector
 * @typedef {(string|Node|NodeList|EventTarget|null)} Selector
 */

/**
 * Event to listen to 
 * @typedef {(string|string[])} EventType
 */

/**
 * Cleanup event listener
 * @callback RemoveListener
 * @returns {AttachListener}
 */

/**
 * ReAttach event listener
 * @callback AttachListener
 * @returns {RemoveListener}
 */

/**
 * Add an event listener
 * @callback AddEventListener
 * @param {Selector}  elements  - Element(s) to attach event(s) to.
 * @param {EventType} eventType - Event(s) to listen to 
 * @param {Function}  [handler] - Function to fire
 * @param {Object}    [options] - Event listener options
 * @param {Boolean}   [options.once] - Trigger handler just once
 * @returns {RemoveListener}
 */

/** @type {AddEventListener} */
export const addListener = createListener(EVENT)

/**
 * Remove an event listener
 * @callback RemoveEventListener
 * @param {Selector}  elements  - Element(s) to remove event(s) from.
 * @param {EventType} eventType - Event(s) to remove
 * @param {Function}  [handler] - Function to remove
 * @param {Object}    [options] - Event listener options
 * @param {Boolean}   [options.once] - Trigger handler just once
 * @returns {AttachListener}
 */

/** @type {RemoveEventListener} */
export const removeListener = createListener()


function wrap(existing, newFunction, context = null) {
  if (!isFunction(existing)) return newFunction
  return function () {
    existing.apply(context, arguments)
    newFunction.apply(context, arguments)
  }
}

// https://gist.github.com/DavidWells/18ff6633ce356237ef91c764812ee08a
export function addWindowEvent(event, fn) {
  if (!isBrowser || !isFunction(window[event])) {
    return window[event] = fn
  }
  return wrap(window[event], fn, window)
}

export const onError = addWindowEvent.bind(null, 'onerror')
export const onLoad = addWindowEvent.bind(null, 'onload')