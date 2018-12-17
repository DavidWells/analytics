import EVENTS from '../events'
import getPluginByMethod from '../utils/getPluginByMethod'
import getCallback from '../utils/getCallback'
import filterDisabled from '../utils/filterDisabled'
import waitForReady from '../utils/waitForReady'

let eventQueue = []

export default function trackMiddleware(getIntegrations, instance) {
  const timeoutMax = 10000
  return store => next => action => {
    const { eventName, payload, options, callback, timestamp } = action

    // Handle initialize
    if (action.type === EVENTS.TRACK_INIT) {
      const eventData = {
        eventName: eventName,
        payload: formatPayload(eventName, payload),
        options: options
      }

      // if abort === true stop the rest
      if (action.abort || !eventName || typeof eventName !== 'string' || eventName.match((/\[object/))) {
        // Todo add reason why aborting happened
        setTimeout(() => {
          store.dispatch({
            type: EVENTS.TRACK_ABORT,
            timestamp: timestamp,
            reason: getReason(action),
            ...eventData
          })
        }, 0)
        return next(action)
      }

      // setTimeout to ensure runs after `trackInit`
      setTimeout(() => {
        store.dispatch({
          type: EVENTS.TRACK,
          timestamp: timestamp,
          ...eventData
        })
      }, 0)
      return next(action)
    }

    if (action.type === EVENTS.TRACK) {
      let newCompleted = []
      let ignored = []
      const dispatchData = {
        eventName,
        payload,
        options
      }
      const trackCalls = filterDisabled(
        getPluginByMethod('track', getIntegrations()),
        store.getState().plugins,
        options
      ).map((provider) => {
        return waitForReady(provider, timeoutMax, store).then((d) => {
          const { queue } = d

          if (queue) {
            console.log('ADD call to queue', provider.NAMESPACE)
            eventQueue = eventQueue.concat(`${provider.NAMESPACE}-${eventName}`)
            return false
          }

          // Make provider track call
          provider.track(eventName, payload, options, instance)

          store.dispatch({
            type: EVENTS.TRACK_TYPE(provider.NAMESPACE),
            timestamp: timestamp,
            ...dispatchData
          })

          newCompleted = newCompleted.concat(provider.NAMESPACE)

          // TODO fire logic here
          return d
        }).catch((e) => {
          // Dispatch Load error
          store.dispatch({
            type: EVENTS.TRACK_TIME_OUT,
            timestamp: timestamp,
            integration: provider.NAMESPACE,
            ...dispatchData,
          })

          ignored = ignored.concat(provider.NAMESPACE)

          return e
        })
      })

      // When all track calls complete
      Promise.all(trackCalls).then((track) => {
        const cb = getCallback(payload, options, callback)
        if (cb) {
          cb(store.getState())
        }
        // dispatch completion event for middlewares
        const skipped = ignored && ignored.length ? { skipped: ignored } : {}
        // setTimeout to ensure runs after 'track'
        setTimeout(() => {
          store.dispatch({
            ...{ type: EVENTS.TRACK_COMPLETE },
            timestamp: timestamp,
            ...dispatchData,
            ...{ completed: newCompleted },
            ...skipped
          })
        }, 0)
      })
    }
    return next(action)
  }
}

function formatPayload(eventName, payload) {
  let data = {}
  if (typeof eventName === 'object') {
    data = eventName
  } else if (typeof payload === 'object') {
    data = payload
  }
  return data
}

function getReason(action) {
  const { reason, eventName } = action
  if (reason) {
    return reason
  } else if (!eventName) {
    return 'Missing eventName'
  } else if (typeof eventName !== 'string') {
    return 'eventName is malformed'
  } else if (eventName.match(/\[object/)) {
    return 'eventName contains [object Object]'
  }
}
