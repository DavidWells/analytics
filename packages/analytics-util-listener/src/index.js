import { isBrowser, isArray, isString, noOp } from '@analytics/type-utils'

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
  return isArray(obj) ? obj : [ obj ]
}

function oncify(handler, opts) {
  return (opts && opts.once) ? once(handler) : handler
}

function once(fn, context) {
  var result
  return function() {
    if (fn) {
      result = fn.apply(context || this, arguments)
      fn = null
    }
    return result
  }
}

const addListener = createListener(EVENT)
const removeListener = createListener()

export {
  /* Fire function only once */
  once,
  /* Listen to onSubmit events on 1 or more elements */
  addListener,
  /* Listen to onChange events on 1 or more elements */
  removeListener,
}