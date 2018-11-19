import { uuid, storage } from 'analytics-utils'
import { USER_ID, USER_TRAITS } from '../constants'
import EVENTS from '../events'
import getIntegrationByMethod from '../utils/getIntegrationByMethod'
import getCallback from '../utils/getCallback'
import filterDisabled from '../utils/filterDisabled'
import waitForReady from '../utils/waitForReady'

let eventQueue = []

export default function identifyMiddleware(getIntegrations, instance) {
  return store => next => action => {
    const { userId, traits, options, callback, timestamp } = action
    if (action.type === EVENTS.IDENTIFY_INIT) {
      if (action.abort) {
        store.dispatch({
          type: EVENTS.IDENTIFY_ABORT,
          timestamp: timestamp,
          reason: action.reason,
        })
        return next(action)
      }

      const currentId = storage.getItem(USER_ID)
      const currentTraits = storage.getItem(USER_TRAITS) || {}
      if (currentId && (currentId !== userId)) {
        store.dispatch({
          type: EVENTS.USER_ID_CHANGED,
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

      let newCompleted = []
      let ignored = []
      let timeoutMax = 10000

      // setTimeout to ensure runs after `identifyInit`
      setTimeout(() => {
        store.dispatch({
          type: EVENTS.IDENTIFY,
          timestamp: timestamp,
          userId: userId,
          traits: traits,
          options: options,
        })
      }, 0)

      const idCalls = filterDisabled(
        getIntegrationByMethod('identify', getIntegrations()),
        store.getState().integrations,
        options
      ).map((provider) => {
        return waitForReady(provider, timeoutMax, store).then((d) => {
          const { queue } = d
          if (queue) {
            console.log('ADD call to queue', provider.NAMESPACE)
            eventQueue = eventQueue.concat(`${provider.NAMESPACE}-${userId}`)
            return false
          }

          // Call provider method
          provider.identify(userId, traits, options, instance)

          /* Run namespaced .identify calls */
          store.dispatch({
            type: EVENTS.IDENTIFY_NAMESPACE(provider.NAMESPACE),
            timestamp: timestamp
          })

          newCompleted = newCompleted.concat(provider.NAMESPACE)

          // TODO fire logic here
          return d
        }).catch((e) => {
          // Dispatch Load error
          store.dispatch({
            type: EVENTS.IDENTIFY_TIME_OUT,
            timestamp: timestamp,
            name: provider.NAMESPACE,
          })

          ignored = ignored.concat(provider.NAMESPACE)

          return e
        })
      })

      Promise.all(idCalls).then((calls) => {
        const skipped = ignored && ignored.length ? { skipped: ignored } : {}

        // setTimeout to ensure runs after 'identify'
        setTimeout(() => {
          store.dispatch({
            type: EVENTS.IDENTIFY_COMPLETE,
            timestamp: timestamp,
            ...{ completed: newCompleted },
            ...skipped
          })
        }, 0)

        const cb = getCallback(traits, options, callback)
        if (cb) {
          cb(store.getState())
        }
      })
    }
    return next(action)
  }
}
