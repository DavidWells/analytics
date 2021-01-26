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

/*
  Todo: emit events for keys we care about
  window.addEventListener('storage', (event) => console.log(event));
*/
