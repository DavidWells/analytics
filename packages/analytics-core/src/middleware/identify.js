import { isFunction } from 'analytics-utils'
import { USER_ID, USER_TRAITS, ANON_ID } from '../constants'
import EVENTS from '../events'

export default function identifyMiddleware(instance) {
  const { setItem, removeItem, getItem } = instance.storage
  return store => next => action => {
    const { userId, traits, options, callback } = action
    /* Reset user id and traits */
    if (action.type === EVENTS.reset) {
      // Remove stored data
      [ USER_ID, USER_TRAITS, ANON_ID ].forEach((key) => removeItem(key))
      if (isFunction(callback)) {
        callback()
      }
    }
    if (action.type === EVENTS.identify) {
      const currentId = getItem(USER_ID)
      const currentTraits = getItem(USER_TRAITS) || {}
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
        })
      }

      /* Save user id */
      if (userId) {
        setItem(USER_ID, userId)
      }

      /* Save user traits */
      if (traits) {
        setItem(USER_TRAITS, {
          ...currentTraits,
          ...traits
        })
      }
    }
    return next(action)
  }
}
