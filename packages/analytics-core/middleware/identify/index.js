import { storage } from 'analytics-utils'
import { USER_ID, USER_TRAITS } from '../../constants'
import EVENTS from '../../events'
import getIntegrationsWithMethod from '../../utils/getIntegrationsWithMethod'
import getCallbackFromArgs from '../../utils/getCallback'

export default function identifyMiddleware(getIntegrations) {
  return store => next => action => {
    const { type, userId, traits, options, callback } = action
    if (type === EVENTS.IDENTIFY_INIT) {
      const identifyCalls = getIntegrationsWithMethod(getIntegrations(), 'identify')
      const cb = getCallbackFromArgs(traits, options, callback)

      storage.setItem(USER_ID, userId)

      if (traits) {
        storage.setItem(USER_TRAITS, traits)
      }
      // No identify middleware attached
      if (!identifyCalls.length) {
        store.dispatch({
          type: EVENTS.IDENTIFY,
          userId: userId,
          traits: traits,
          options: options,
          // callback: callback
        })
        return store.dispatch({
          ...{ type: EVENTS.IDENTIFY_COMPLETE }
        })
      }

      // TODO SAVE ID TO LOCALSTORAGE

      // TODO save traits to localstorage

      let count = 0
      let completed = []
      let hasRan = false

      /* Filter out disabled integrations */
      identifyCalls.filter((provider) => {
        const integrations = options && options.integrations
        const disabled = integrations && integrations[provider.NAMESPACE] === false
        if (disabled) {
          console.log('ABORT Identify >>>>>', provider.NAMESPACE, type)
        }
        return !disabled
      /* Handle all .identify calls */
      }).forEach((provider) => {
        const { NAMESPACE } = provider
        // check for ready state on integration and recursively call til rdy
        let timeoutMax = 10000
        let timer = 0
        const runWhenScriptLoaded = () => {
          const state = store.getState()
          const { loaded, enabled } = state.integrations[NAMESPACE]

          if (!enabled) {
            console.log('ABORT Identity viw >>>>>', NAMESPACE, type)
            count = count + 1
            // all track calls complete
            if (identifyCalls === identifyCalls.length) {
              // Todo this logic is duplicated above in after abort
              identifyCompleted(store, completed, cb)
            }
            return false
          }

          if (!loaded) {
            // TODO: set max try limit and add calls to local queue on fail
            if (timer > timeoutMax) {
              store.dispatch({
                type: EVENTS.IDENTIFY_TIME_OUT,
                name: NAMESPACE
              })
              // TODO: save to queue
              return false
            }
            timer = timer + 10
            setTimeout(runWhenScriptLoaded, 10)
            return false
          }

          /* Run .identify dispatch once. Each Namespaced calls run below */
          if (!hasRan) {
            hasRan = true
            store.dispatch({
              type: EVENTS.IDENTIFY,
              userId: userId,
              traits: traits,
              options: options,
              // callback: callback
            })
          }

          /* run integration[x] .identify function */
          provider.identify(userId, traits, options)

          /* Run namespaced .identify calls */
          store.dispatch({
            type: EVENTS.IDENTIFY_NAMESPACE(NAMESPACE)
          })

          // increment success counter
          count = count + 1
          completed = completed.concat(NAMESPACE)
          // all identify calls complete
          if (count === identifyCalls.length) {
            identifyCompleted(store, completed, cb)
          }
        }
        runWhenScriptLoaded()
      })
    }
    // resume
    return next(action)
  }
}

function identifyCompleted(store, completed, cb) {
  // dispatch completion event for middlewares
  store.dispatch({
    type: EVENTS.IDENTIFY_COMPLETE,
    ...{ integrations: completed }
  })
  if (cb) {
    cb(store)
  }
}
