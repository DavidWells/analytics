import { storage } from 'analytics-utils'
import timestamp from '../utils/timestamp'
import EVENTS from '../events'

export default function storageMiddleware() {
  /*
    Todo: emit events for keys we care about
    window.addEventListener('storage', (event) => console.log(event));
  */
  return store => next => action => {
    const { type, key, value, options } = action
    if (type === EVENTS.setItem || type === EVENTS.removeItem) {
      if (action.abort) {
        return next(action)
      }
      // Run storage set or remove
      if (type === EVENTS.setItem) {
        storage.setItem(key, value, options)
      } else {
        storage.removeItem(key, options)
      }
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
    timestamp: timestamp(),
    key: key,
    value: value,
    options: opts,
  }
}

export const removeItem = (key, opts) => {
  return {
    type: EVENTS.removeItemStart,
    timestamp: timestamp(),
    key: key,
    options: opts,
  }
}
