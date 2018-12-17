import EVENTS from '../events'
import getPluginByMethod from '../utils/getPluginByMethod'
import getCallback from '../utils/getCallback'
import filterDisabled from '../utils/filterDisabled'
import waitForReady from '../utils/waitForReady'

let eventQueue = []

export default function pageMiddleware(instance, getPlugins) {
  return store => next => action => {
    const { data, options, callback, timestamp } = action
    if (action.type === EVENTS.PAGE_INIT) {
      if (action.abort) {
        store.dispatch({
          type: EVENTS.PAGE_ABORT,
          timestamp: timestamp,
          reason: action.reason,
        })
        return next(action)
      }
      // No page middleware attached
      const timeoutMax = 1000
      let newCompleted = []
      let ignored = []

      const pageData = data
      // @Todo decide if this is worth it... & verify this is ok idea from plugins
      // Allows for plugin level cancelation by aborting the timestamp trace id of an action
      const isFrozen = instance.getState('page').abort.includes(timestamp)
      // console.log('timestamp is aborted', isFrozen)
      if (isFrozen) {
        store.dispatch({
          type: EVENTS.PAGE_ABORT,
          timestamp: timestamp,
          reason: action.reason,
        })
        return next(action)
      }

      store.dispatch({
        type: EVENTS.PAGE,
        timestamp: timestamp,
        data: pageData,
        options: options,
      })

      const pageCalls = filterDisabled(
        getPluginByMethod('page', getPlugins()),
        store.getState().plugins,
        options
      ).map((provider) => {
        return waitForReady(provider, timeoutMax, store).then((d) => {
          const { queue } = d
          if (queue) {
            // console.log('ADD call to queue', provider.NAMESPACE)
            eventQueue = eventQueue.concat(`${provider.NAMESPACE}-page`)
            return false
          }

          /* run integration[x] .page function */
          provider.page(pageData, options, instance)

          /* Run Namespaced .page calls */
          store.dispatch({
            type: EVENTS.PAGE_TYPE(provider.NAMESPACE),
            timestamp: timestamp,
            data: pageData,
          })

          newCompleted = newCompleted.concat(provider.NAMESPACE)

          // TODO fire logic here
          return d
        }).catch((e) => {
          // Dispatch Load error
          store.dispatch({
            type: EVENTS.PAGE_TIME_OUT,
            timestamp: timestamp,
            name: provider.NAMESPACE,
          })

          ignored = ignored.concat(provider.NAMESPACE)

          return e
        })
      })

      Promise.all(pageCalls).then((calls) => {
        const skipped = ignored && ignored.length ? { skipped: ignored } : {}

        // console.log('page eventQueue', eventQueue)

        // setTimeout to ensure runs after 'page'
        setTimeout(() => {
          store.dispatch({
            type: EVENTS.PAGE_COMPLETE,
            timestamp: timestamp,
            ...{ completed: newCompleted },
            ...skipped
          })
        }, 0)

        const cb = getCallback(data, options, callback)
        if (cb) {
          cb(store.getState(), instance)
        }
      })
    }
    // resume
    return next(action)
  }
}
