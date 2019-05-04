import { storage } from 'analytics-utils'
import timeStamp from '../utils/timestamp'
import EVENTS from '../events'

export default function storageMiddleware() {
  /*
  Todo: emit events for keys we care about
  window.addEventListener('storage', (event) => console.log(event));
  */
  return store => next => action => {
    const { type, key, value, timestamp } = action
    if (type === EVENTS.setItem || type === EVENTS.removeItem) {
      if (action.abort) {
        return next(action)
      }
      // Run storage set or remove
      const method = (type === EVENTS.setItem) ? 'setItem' : 'removeItem'
      storage[method](key, value)
    }
    return next(action)
  }
}

export const getItem = (key, opts) => {
  return storage.getItem(key, opts)
}

export const setItem = (key, value, opts) => {
  return {
    type: EVENTS.setItemStart,
    timestamp: timeStamp(),
    key: key,
    value: value,
    options: opts,
  }
}

export const removeItem = (key, opts) => {
  return {
    type: EVENTS.removeItemStart,
    timestamp: timeStamp(),
    key: key,
    options: opts,
  }
}
