import { storage } from 'analytics-utils'
import timeStamp from '../utils/timestamp'
import EVENTS from '../events'

export default function storageMiddleware(getIntegrations, instance) {
  /*
  Todo: emit events for keys we care about
  window.addEventListener('storage', (event) => console.log(event));
  */
  return store => next => action => {
    const { type, key, value, timestamp } = action
    if (type === EVENTS.SET_ITEM || type === EVENTS.REMOVE_ITEM) {
      const kind = (type === EVENTS.SET_ITEM) ? 'SET_ITEM' : 'REMOVE_ITEM'
      if (action.abort) {
        store.dispatch({
          type: EVENTS[`${kind}_ABORT`],
          timestamp: timestamp,
          reason: action.reason,
        })
        return next(action)
      }
      // Run storage set or remove
      const method = (type === EVENTS.SET_ITEM) ? 'setItem' : 'removeItem'
      storage[method](key, value)

      store.dispatch({
        type: EVENTS[`${kind}_COMPLETE`],
        timestamp: timestamp,
      })
    }
    return next(action)
  }
}

export const getItem = (key) => {
  return storage.getItem(key)
}

export const setItem = (key, value) => {
  return {
    type: EVENTS.SET_ITEM,
    key: key,
    value: value,
    timestamp: timeStamp()
  }
}

export const removeItem = (key) => {
  return {
    type: EVENTS.REMOVE_ITEM,
    key: key,
    timestamp: timeStamp()
  }
}
