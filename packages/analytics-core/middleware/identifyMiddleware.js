import EVENTS from '../events'
import getIntegrationsWithMethod from '../utils/getIntegrationsWithMethod'
import getCallbackFromArgs from '../utils/getCallback'

export default function identifyMiddleware(getIntegrations) {
  return store => next => action => {
    const { type, userId, traits, options, callback } = action
    if (type === EVENTS.IDENTIFY_START) {
      const identifyCalls = getIntegrationsWithMethod(getIntegrations(), 'identify')
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
      let count = 0
      let hasRan = false
      // console.log('identifyCalls', identifyCalls)

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
          const integrationLoaded = state.integrations[NAMESPACE].loaded
          if (!integrationLoaded) {
            // TODO: set max try limit and add calls to local queue on fail
            if (timer > timeoutMax) {
              store.dispatch({
                type: 'identifyTimeout',
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
          store.dispatch({ type: `identify:${NAMESPACE}` })

          // increment success counter
          count = count + 1
          // all identify calls complete
          if (count === identifyCalls.length) {
            const cb = getCallbackFromArgs(traits, options, callback)
            if (cb) cb(state)
            // dispatch completion event for middlewares
            store.dispatch({
              type: EVENTS.IDENTIFY_COMPLETE,
            })
          }
        }
        runWhenScriptLoaded()
      })
    }
    // resume
    return next(action)
  }
}
