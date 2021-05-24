const EVENT = 'Event'
const ADD = ['add', 'attach']
const REMOVE = ['remove', 'detach']
const ACTIONS = [ ADD, REMOVE ]
const EventListener = EVENT + 'Listener'

function createListener(add) {
  const [ action, inverse ] = (add) ? ACTIONS : ACTIONS.reverse()
  const method = action[0] + EventListener
  return (elements, events, handler, opts) => {
    /* SSR support */
    if (typeof window === 'undefined') {
      return () => {}
    }
    var options = opts || false
    var events = (isString(events) ? events.split(' ') : events).map(e => e.trim())
    var els = isString(elements) ? Array.from(document.querySelectorAll(elements)) : [elements]
    var connectListener
    /* Throw if no element found */
    if (!els.length) throw new Error('noElements')
    /* Throw if no events found */
    if (!events.length) throw new Error('no' + EVENT)
    /* use add/removeEventListener */
    if (els[0][method]) {
      connectListener = fireAndReturn(() => {
        return els.map((el) => {
          const func = oncify(handler, options)
          events.forEach((evt) => el[method](evt, func, options))
          return func
        })
      })
      /* Return cleanup with re-initialize function */
      return function() {
        els.forEach((el, i) => events.forEach((ev) => {
          el[inverse[0] + EventListener](ev, connectListener.listeners[i], options)
        }))
        return connectListener.fn
      }
    }
    // Fallback to attach/detach event. IE before version 9
    /*
    const ie9fallback = action[1] + EVENT
    if (els[0][ie9fallback]) {
      connectListener = fireAndReturn(() => {
        return els.map((el) => {
          const func = oncify(handler, opts)
          events.forEach((evt) => el[ie9fallback]('on' + evt, func))
          return func
        })
      })
      // Return cleanup with re-initialize function
      return function() {
        els.forEach((el, i) => events.forEach((evt) => {
          el[inverse[1] + EVENT]('on' + evt, connectListener.listeners[i])
        }))
        return connectListener.fn
      }
    }
    */
    /* Fallback for older browsers IE <=8 */
    connectListener = fireAndReturn(() => {
      return els.map((el) => {
        events.forEach((evt) => el['on' + evt] = (add) ? oncify(handler, options) : null)
      })
    })
    /* Return cleanup with re-initialize function */
    return function() {
      els.forEach((el) => {
        events.forEach((evt) => el['on' + evt] = (add) ? null : oncify(handler, options))
      })
      return connectListener.fn
    }
  }
}

function isString(x) {
  return typeof x === 'string'
}

function oncify(handler, opts) {
  if (opts && opts.once) {
    return once(handler)
  }
  return handler
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

function fireAndReturn(fn) {
  const listeners = fn() // attach listener
  return { 
    // fn: once(fn), this causes reattach problems
    fn: fn, 
    listeners 
  }
}

const addListener = createListener(true)
const removeListener = createListener()

export {
  /* Listen to onSubmit events on 1 or more forms */
  addListener,
  /* Listen to onChange events on 1 or more forms */
  removeListener,
}

/* Misc
// return mapper(els, events, handler, options, (el, handle) => (event) => {
//   el[method](event, handle, options)
//   return handle
// })
// mapper(els, events, handler, options, (el) => (event, i) => {
//   console.log(`disable ${event}`, inverse[0] + EventListener, el)
//   console.log(connectListener.listeners[i])
//   el[inverse[0] + EventListener](event, connectListener.listeners[i], options)
// })
*/
// function mapper(elements, events, handler, opts, applier) {
//   return elements.map((el) => {
//     const handle = opts && opts.once ? once(handler) : handler
//     events.forEach(applier(el, handle))
//     return handle
//   })
// }