import { addListener } from '@analytics/listener-utils'
import { onTabChange } from 'analytics-plugin-tab-events'

const DOCUMENT_EVENTS = [
  'mousemove', 'mousedown',
  'touchmove', 'touchstart',
  'touchend', 'keydown',
]

/**
 * Attaches DOM event listeners to track user activity and calls a callback when activity is detected
 * @param {Function} callback - Function to call when DOM activity is detected
 * @param {Object} opts - Configuration options
 * @param {number} [opts.throttle=10000] - Throttle time in milliseconds to limit callback frequency
 * @returns {Function} Function that when called removes all listeners and returns a function to reattach them
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

/**
 * Creates an idle detector that calls a callback when the user becomes idle
 * @param {Function} onIdle - Function to call when user becomes idle
 * @param {Object} opts - Configuration options
 * @param {number} [opts.timeout=10000] - Time in milliseconds before user is considered idle
 * @param {number} [opts.throttle=2000] - Throttle time in milliseconds for activity detection
 * @returns {Object} Object with disable and getStatus methods
 */
export function onIdle(onIdle, opts = {}) {
  return onUserActivity({ onIdle, ...opts })
}

/**
 * Creates a wake-up detector that calls a callback when the user becomes active after being idle
 * @param {Function} onWakeUp - Function to call when user becomes active after being idle
 * @param {Object} opts - Configuration options
 * @param {number} [opts.timeout=10000] - Time in milliseconds before user is considered idle
 * @param {number} [opts.throttle=2000] - Throttle time in milliseconds for activity detection
 * @returns {Object} Object with disable and getStatus methods
 */
export function onWakeUp(onWakeUp, opts = {}) {
  return onUserActivity({ onWakeUp, ...opts })
}

/**
 * Creates a comprehensive user activity tracker that can detect idle, wake-up, and heartbeat events
 * @param {Object} config - Configuration object
 * @param {Function} [config.onIdle] - Function to call when user becomes idle
 * @param {Function} [config.onWakeUp] - Function to call when user becomes active after being idle
 * @param {Function} [config.onHeartbeat] - Function to call periodically while user is active
 * @param {number}   [config.timeout=10000] - Time in milliseconds before user is considered idle
 * @param {number}   [config.throttle=2000] - Throttle time in milliseconds for activity detection
 * @returns {Object} Object with disable and getStatus methods
 */
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
      onHeartbeat(getElapsed(startTime, isDisabled), event)
    }

    if (onWakeUp && isIdle) {
      isIdle = false
      onWakeUp(getElapsed(idleStart, isDisabled), event)
      startTime = new Date()
    }
    /* set timeout to wait for idle mode */
    t = setTimeout(function () {
      isIdle = true
      if (onIdle) {
        idleStart =  new Date()
        onIdle(getElapsed(startTime, isDisabled), event)
      }
    }, timeout)
  }

  const disableListener = onDomActivity(pingSession, { throttle })

  // Start idle tracking immediately
  pingSession({ type: 'init' })

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

/**
 * Calculates the elapsed time in seconds since a given time
 * @param {Date} time - The start time to calculate elapsed time from
 * @param {boolean} isDisabled - Whether the timer is disabled
 * @returns {number} Elapsed time in seconds, or 0 if disabled
 */
function getElapsed(time, isDisabled) {
  return (isDisabled) ? 0 : Math.round((new Date().getTime() - time.getTime()) / 1e3)
}

/**
 * A throttled function is called once per N amount of time
 * @param {Function} callback - The function to throttle
 * @param {number} limit - The throttle limit in milliseconds
 * @returns {Function} Throttled version of the callback function
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

/**
 * Adds unload event listeners to handle page visibility changes and page unload
 * @param {Function} unloadEvent - Function to call when page is unloading or becoming hidden
 */
function addUnloadEvent(unloadEvent) {
  let executed = false
  let fn = () => {
    if (!executed) {
      executed = true
      unloadEvent()
    }
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      fn()
    }
  })
  window.addEventListener('pagehide', fn)
  window.addEventListener('beforeunload', fn)
  window.onbeforeunload = fn
}