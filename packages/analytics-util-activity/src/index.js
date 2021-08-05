import { addListener } from '@analytics/listener-utils'
import { onTabChange } from 'analytics-plugin-tab-events'

const DOCUMENT_EVENTS = [
  'mousemove', 'mousedown',
  'touchmove', 'touchstart',
  'touchend', 'keydown',
]

/**
 * 
 * @param {Function} callback 
 * @param {Object} opts 
 * @returns 
 */
export function onDomActivity(callback, opts = {}) {
  const handler = throttle(callback, opts.throttle || 10000)
  let listeners = []

  function attach() {
    const tabListener = onTabChange((isHidden) => {
      if (!isHidden) handler({ type: 'tabVisible' })
    })

    listeners = [ tabListener ]
    .concat(DOCUMENT_EVENTS.map(event => addListener(document, event, handler)))
    .concat(addListener(window, 'load', handler))
    .concat(addListener(window, 'scroll', handler, { capture: true, passive: true }))

    return detach
  }

  function detach() {
    listeners.map(detach => detach())
  }

  attach() // attach listeners

  return function() {
    detach() // remove listeners
    return attach
  }
}

export function onIdle(onIdle, opts = {}) {
  return onUserActivity({ onIdle, ...opts })
}

export function onWakeUp(onWakeUp, opts = {}) {
  return onUserActivity({ onWakeUp, ...opts })
}

export function onUserActivity({ 
  onIdle, 
  onWakeUp,
  onHeartbeat,
  timeout = 10e3, // 10000
  throttle = 2e3  // 2000
}) {
  let t, idleStart
  let isIdle = false
  let isDisabled = false
  let startTime = new Date()

  const cancelTimer = () => clearTimeout(t)
  const getActive = () => (isIdle) ? 0 : getElapsed(startTime, isDisabled)
  const getIdle = () => (!isIdle) ? 0 : getElapsed(idleStart, isDisabled)

  function pingSession(event) {
    cancelTimer()

    if (onHeartbeat && !isIdle) {
      onHeartbeat(getElapsed(startTime), event)
    }

    if (onWakeUp && isIdle) {
      isIdle = false
      onWakeUp(getElapsed(idleStart), event)
      startTime = new Date()
    }
    /* set timeout to wait for idle mode */
    t = setTimeout(function () {
      isIdle = true
      if (onIdle) {
        idleStart =  new Date()
        onIdle(getElapsed(startTime), event)
      }
    }, timeout)
  }

  const disableListener = onDomActivity(pingSession, { throttle })

  return {
    disable: () => {
      isDisabled = true
      isIdle = false
      /* cancel in flight onIdle handlers */
      cancelTimer()
      /* disable event listeners */
      const enableListener = disableListener()
      /* return re-start & attach listener function */
      return () => {
        isDisabled = false
        startTime = new Date()
        pingSession({ type: 'load' })
        return enableListener()
      }
    },
    getStatus: () => {
      return {
        isIdle, 
        isDisabled, 
        active: getActive(), 
        idle: getIdle() 
      }
    }
  }
}

function getElapsed(time, isDisabled) {
  return (isDisabled) ? 0 : Math.round((new Date() - time) / 1e3)
}

/**
 * A throttled function is called once per N amount of time
 * @param {Function} callback 
 * @param {Number} limit 
 * @returns 
 */
function throttle(callback, limit) {
  var wait = false
  return (e) => {
    if (!wait) { 
      callback.call(this, e)
      wait = true
      setTimeout(() => wait = false, limit);
    }
  }
}