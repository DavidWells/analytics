import timestamp from '../utils/timestamp'
import EVENTS from '../events'

export default function storageMiddleware(storage) {
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

export const setItem = (key, value, options) => {
  /** @type {SetItemPayload} */
  return {
    type: EVENTS.setItemStart,
    timestamp: timestamp(),
    key,
    value,
    options,
  }
}

export const removeItem = (key, options) => {
  /** @type {RemoveItemPayload} */
  return {
    type: EVENTS.removeItemStart,
    timestamp: timestamp(),
    key,
    options,
  }
}

/*
  Todo: emit events for keys we care about
  window.addEventListener('storage', (event) => console.log(event));
*/
