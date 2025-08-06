import { addListener } from '@analytics/listener-utils'
import { onTabChange } from 'analytics-plugin-tab-events'

const DOCUMENT_EVENTS = [
  'mousemove', 'mousedown',
  'touchmove', 'touchstart',
  'touchend', 'keydown',
]

/**
 * @typedef {Object} ActivityEvent
 * @property {('load'|'init'|'mousemove'|'mousedown'|'touchmove'|'touchstart'|'touchend'|'keydown'|'scroll'|'tabVisible')} type - The type of activity event
 */

/**
 * @typedef {Function} ActivityCallback
 * @param {ActivityEvent} event - The activity event that triggered the callback
 */

/**
 * @typedef {Object} ActivityOptions
 * @property {number} [throttle=10000] - Throttle time in milliseconds to limit callback frequency
 */

/**
 * @typedef {Function} DisableFunction
 * @returns {EnableFunction} Function to re-enable the activity tracker
 */

/**
 * @typedef {Function} EnableFunction
 * @returns {DisableFunction} Function to disable the activity tracker
 */

/**
 * Attaches DOM event listeners to track user activity and calls a callback when activity is detected
 * @param {ActivityCallback} callback - Function to call when DOM activity is detected
 * @param {ActivityOptions} opts - Configuration options
 * @returns {DisableFunction} Function that when called removes all listeners and returns a function to reattach them
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
 * @typedef {Function} OnIdleCallback
 * @param {number} activeTime - Time in seconds the user was active before becoming idle
 * @param {ActivityEvent} event - The activity event that triggered the idle state
 */

/**
 * @typedef {Object} OnIdleOptions
 * @property {number} [timeout=10000] - Time in milliseconds before user is considered idle
 * @property {number} [throttle=2000] - Throttle time in milliseconds for activity detection
 */

/**
 * @typedef {Object} UserActivityStatus
 * @property {boolean} isIdle - Whether the user is currently idle
 * @property {boolean} isDisabled - Whether the activity tracker is disabled
 * @property {number} active - Time in seconds the user has been active
 * @property {number} idle - Time in seconds the user has been idle
 */

/**
 * @typedef {Object} UserActivityReturn
 * @property {DisableFunction} disable - Function to disable the activity tracker
 * @property {Function} getStatus - Function that returns the current status
 * @returns {UserActivityStatus} Current status of the activity tracker
 */

/**
 * Creates an idle detector that calls a callback when the user becomes idle
 * @param {OnIdleCallback} onIdle - Function to call when user becomes idle
 * @param {OnIdleOptions} opts - Configuration options
 * @returns {UserActivityReturn} Object with disable and getStatus methods
 */
export function onIdle(onIdle, opts = {}) {
  return onUserActivity({ onIdle, ...opts })
}

/**
 * @typedef {Function} WakeUpCallback
 * @param {number} idleTime - Time in seconds the user was idle before becoming active
 * @param {ActivityEvent} event - The activity event that triggered the wake up
 */

/**
 * Creates a wake-up detector that calls a callback when the user becomes active after being idle
 * @param {WakeUpCallback} onWakeUp - Function to call when user becomes active after being idle
 * @param {OnIdleOptions} opts - Configuration options
 * @returns {UserActivityReturn} Object with disable and getStatus methods
 */
export function onWakeUp(onWakeUp, opts = {}) {
  return onUserActivity({ onWakeUp, ...opts })
}

/**
 * @typedef {Function} HeartbeatCallback
 * @param {number} activeTime - Time in seconds the user has been active
 * @param {ActivityEvent} event - The activity event that triggered the heartbeat
 */

/**
 * @typedef {Object} UserActivityOptions
 * @property {OnIdleCallback} [onIdle] - Function to call when user becomes idle
 * @property {WakeUpCallback} [onWakeUp] - Function to call when user becomes active after being idle
 * @property {HeartbeatCallback} [onHeartbeat] - Function to call periodically while user is active
 * @property {number} [timeout=10000] - Time in milliseconds before user is considered idle
 * @property {number} [throttle=2000] - Throttle time in milliseconds for activity detection
 */

/**
 * Creates a comprehensive user activity tracker that can detect idle, wake-up, and heartbeat events
 * @param {UserActivityOptions} config - Configuration object
 * @returns {UserActivityReturn} Object with disable and getStatus methods
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

  // Start idle tracking immediately on load
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
 * @param {ActivityCallback} callback - The function to throttle
 * @param {number} limit - The throttle limit in milliseconds
 * @returns {ActivityCallback} Throttled version of the callback function
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
 * @typedef {Function} UnloadCallback
 * Function to call when page is unloading or becoming hidden
 */

/**
 * Adds unload event listeners to handle page visibility changes and page unload
 * @param {UnloadCallback} unloadEvent - Function to call when page is unloading or becoming hidden
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