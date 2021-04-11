const ADD = ['add', 'attach']
const REMOVE = ['remove', 'detach']
const ACTIONS = [ ADD, REMOVE ]
const EventListener = 'EventListener'

// TODO support multiple events
// events.split(' ').forEach(ev => { fn(ev, func) })

function listenerFuncFactory(toAdd) {
  if (typeof window === 'undefined') return // SSR support
  const [ action, inverse ] = (toAdd) ? ACTIONS : ACTIONS.reverse()
  const method = action[0] + EventListener
  return (element, event, listener, opts) => {
    if (!element) throw new Error('Element not found')
    var onEvent = 'on' + event
    var options = opts || false
    if (element[method]) {
      var connectEventListener = () => element[method](event, listener, options)
      connectEventListener()
      // Return inverse listener with re-initialize function
      return () => {
        element[inverse[0] + EventListener](event, listener, options)
        return connectEventListener
      }
    }
    // Fallback to attach/detach event
    if (element[action[1]]) {
      var connectAttachListener = () => element[action[1]](onEvent, listener)
      connectAttachListener()
      // Return inverse listener
      return () => {
        element[inverse[1]](onEvent, listener)
        return connectAttachListener
      }
    }
    // Fallback for older browsers IE <=8
    var connectFallbackListener = () => element[onEvent] = (toAdd) ? listener : null
    connectFallbackListener()
    return () => {
      element[onEvent] = (toAdd) ? null : listener
      return connectFallbackListener
    }
  }
}

const addListener = listenerFuncFactory(true)
const removeListener = listenerFuncFactory()

export {
  /* Listen to onSubmit events on 1 or more forms */
  addListener,
  /* Listen to onChange events on 1 or more forms */
  removeListener,
}
