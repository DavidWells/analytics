import { USER_ID, USER_TRAITS, ANON_ID } from '../constants'
import EVENTS from '../events'

export default function identifyMiddleware(instance) {
  const { storage } = instance
  return store => next => action => {
    const { userId, traits, options, callback } = action
    if (action.type === EVENTS.reset) {
      storage.removeItem(USER_ID)
      storage.removeItem(USER_TRAITS)
      storage.removeItem(ANON_ID)
      if (callback && typeof callback === 'function') {
        callback()
      }
    }
    if (action.type === EVENTS.identify) {
      const currentId = storage.getItem(USER_ID)
      const currentTraits = storage.getItem(USER_TRAITS) || {}
      if (currentId && (currentId !== userId)) {
        store.dispatch({
          type: EVENTS.userIdChanged,
          old: {
            userId: currentId,
            traits: currentTraits,
          },
          new: {
            userId,
            traits
          },
          options: options,
          // callback: callback
        })
      }

      if (userId) {
        storage.setItem(USER_ID, userId)
      }

      if (traits) {
        storage.setItem(USER_TRAITS, {
          ...currentTraits,
          ...traits
        })
      }
    }
    return next(action)
  }
}
