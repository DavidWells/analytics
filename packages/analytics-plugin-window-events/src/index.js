
const EVENTS = {
  /**
   * `windowLeft` - Fires when visitor leaves the window.
   */
  windowLeft: 'windowLeft',
  /**
   * `windowEnter` - Fires when visitor enters the window.
   * This fires only when coming back into the window after leaving it.
   */
  windowEnter: 'windowEnter'
}

export default function windowEventsPlugin(userConfig = {}) {
  return {
    name: 'window-events',
    EVENTS: EVENTS,
    config: userConfig,
    bootstrap: ({ instance }) => {
      // Dispatch events when visitor leaves window
      mouseOut(leftWindow => {
        instance.dispatch({
          type: (leftWindow) ? EVENTS.windowLeft : EVENTS.windowEnter,
        })
      })
    }
  }
}

// TODO import lodash throttle?
function throttle(func, wait) {
  var context, args, result
  var timeout = null
  var previous = 0
  var later = function() {
    previous = new Date()
    timeout = null
    result = func.apply(context, args)
  }
  return function() {
    var now = new Date()
    if (!previous) previous = now
    var remaining = wait - (now - previous)
    context = this
    args = arguments
    if (remaining <= 0) {
      clearTimeout(timeout)
      timeout = null
      previous = now
      result = func.apply(context, args)
    } else if (!timeout) {
      timeout = setTimeout(later, remaining)
    }
    return result
  }
}

export function mouseOut(cb) {
  if (typeof window === 'undefined') return false
  let out = false
  document.addEventListener('mouseout', throttle((e) => {
    const evt = e || window.event
    const from = evt.relatedTarget || evt.toElement
    if (!from || from.nodeNode === 'HTML') {
      out = true
      return cb(out)
    }
  }))
  document.addEventListener('mousemove', throttle((e) => {
    if (out) {
      out = false
      return cb(out)
    }
  }))
}
