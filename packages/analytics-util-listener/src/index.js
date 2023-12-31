import { isBrowser, isString, isFunction, ensureArray, noOp } from '@analytics/type-utils'

const EVENT = 'Event'
const EL = EVENT + 'Listener'

function createListener(add) {
  return (els, evts, callback, options) => {
    const handler = callback || noOp
    const opts = options || false
    /* SSR support */
    if (!isBrowser) return handler
    const events = toArray(evts)
    const elements = toArray(els, true)
    /* Throw if no element found */
    if (!elements.length) throw new Error('noElements')
    /* Throw if no events found */
    if (!events.length) throw new Error('no' + EVENT)
    let fns = []
    function smartAttach(isAdd) {
      if (isAdd) fns = []
      const method = (isAdd) ? 'add' + EL : 'remove' + EL
      // Apply to all elements
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i]
        fns[i] = (isAdd ? ((opts && opts.once) ? once(handler) : handler) : fns[i] || handler)
        // Apply to all events
        for (let n = 0; n < events.length; n++) {
          if (!el[method]) {
            el[method](events[n], fns[i], opts)
            continue;
          }
          el['on' + events[n]] = (isAdd) ? fns[i] : null /* Fallback for older browsers IE <=8 */
        }
      }
      // return opposite function with inverse event handler
      return smartAttach.bind(null, !isAdd)
    }
    /* // debug
    console.log('events', events)
    console.log('elements', elements)
    /** */
    return smartAttach(add)
  }
}

function strToArray(str) {
  return str.split(str.indexOf(',') > -1 ? ',' : ' ').map(e => e.trim())
}

function toArray(val, isSelector) {
  if (isString(val)) {
    return isSelector ? toArray(document.querySelectorAll(val)) : strToArray(val)
  }
  // Convert NodeList to Array
  if (NodeList.prototype.isPrototypeOf(val)) {
    const nodes = []
    for (var i = val.length >>> 0; i--;) {
      nodes[i] = val[i] // iterate backwards ensuring that length is an UInt32
    }
    return nodes
  }
  // Arrayify
  const array = ensureArray(val)
  return (!isSelector) ? array : array.map((v) => isString(v) ? toArray(v, true) : v).flat()
}

/**
 * Run function once
 * @param {Function} fn - Function to run just once
 * @param {*} [context] - Extend function context
 * @returns {Function} Function that only runs 1 time
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
 * Element selector or valid DOM node
 * @typedef {(string|Node|NodeList|EventTarget|null)} Selector
 */

/**
 * Event or events to addEventListener to 
 * @typedef {(string|string[])} EventType
 */

/**
 * Cleanup event listener
 * @callback RemoveListener
 * @returns {AttachListener}
 */

/**
 * Reattach event listener
 * @callback AttachListener
 * @returns {RemoveListener}
 */

/**
 * Add an event listener
 * @callback AddListener
 * @param {Selector}  elements  - Element(s) to attach event(s) to.
 * @param {EventType} eventType - Event(s) to listen to 
 * @param {Function}  [handler] - Function to fire
 * @param {Object}    [options] - Event listener options
 * @param {Boolean}   [options.once] - Trigger handler just once
 * @returns {RemoveListener}
 */

/** @type {AddListener} */
export const addListener = createListener(EVENT)

/**
 * Remove an event listener
 * @callback RemoveListener
 * @param {Selector}  elements  - Element(s) to remove event(s) from.
 * @param {EventType} eventType - Event(s) to remove
 * @param {Function}  [handler] - Function to remove
 * @param {Object}    [options] - Event listener options
 * @param {Boolean}   [options.once] - Trigger handler just once
 * @returns {AttachListener}
 */

/** @type {RemoveListener} */
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