import EVENTS from '../events'
import getIntegrationByMethod from '../utils/getIntegrationByMethod'
import getCallback from '../utils/getCallback'
import filterDisabled from '../utils/filterDisabled'
import waitForReady from '../utils/waitForReady'
import { getPageData } from '../modules/page'

let eventQueue = []

export default function pageMiddleware(getIntegrations, instance) {
  return store => next => action => {
    const { data, options, callback, timestamp } = action
    if (action.type === EVENTS.PAGE_INIT) {
      // No page middleware attached
      const timeoutMax = 1000
      let newCompleted = []
      let ignored = []

      const pageData = { ...getPageData(), ...data }

      // setTimeout to ensure runs after `pageInit`
      setTimeout(() => {
        store.dispatch({
          type: EVENTS.PAGE,
          timestamp: timestamp,
          data: pageData,
          options: options,
        })
      }, 0)

      const pageCalls = filterDisabled(
        getIntegrationByMethod('page', getIntegrations()),
        store.getState().integrations,
        options
      ).map((provider) => {
        return waitForReady(provider, timeoutMax, store).then((d) => {
          const { queue } = d
          if (queue) {
            console.log('ADD call to queue', provider.NAMESPACE)
            eventQueue = eventQueue.concat(`${provider.NAMESPACE}-page`)
            return false
          }

          /* run integration[x] .page function */
          provider.page(pageData, options, instance)

          /* Run Namespaced .page calls */
          store.dispatch({
            type: EVENTS.PAGE_NAMESPACE(provider.NAMESPACE),
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

        console.log('page eventQueue', eventQueue)

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
          cb(store.getState())
        }
      })
    }
    // resume
    return next(action)
  }
}
