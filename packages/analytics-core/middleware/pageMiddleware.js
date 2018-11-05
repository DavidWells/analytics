import EVENTS from '../events'
import getIntegrationsWithMethod from '../utils/getIntegrationsWithMethod'
import getCallbackFromArgs from '../utils/getCallback'
import { getPageData } from '../modules/page'

export default function pageMiddleware(getIntegrations, getState) {
  return store => next => action => {
    const { type, data, options, callback } = action
    if (type === EVENTS.PAGE_INIT) {
      const cb = getCallbackFromArgs(data, options, callback)
      const pageCalls = getIntegrationsWithMethod(getIntegrations(), 'page')
      // No page middleware attached
      if (!pageCalls.length) {
        store.dispatch({
          type: EVENTS.PAGE,
          data: { ...getPageData(), ...data },
          options: options
        })
        return store.dispatch({
          type: EVENTS.PAGE_COMPLETE,
        })
      }

      let count = 0
      let completed = []
      let hasRan = false
      /* Handle all .page calls syncronously */
      pageCalls.filter((provider) => {
        const integrations = options && options.integrations
        const disabled = integrations && integrations[provider.NAMESPACE] === false
        if (disabled) {
          console.log('ABORT PageView>>>>>', provider.NAMESPACE, type)
        }
        return !disabled
      }).forEach((provider) => {
        const { NAMESPACE } = provider
        let timeoutMax = 10000
        let timer = 0
        // TODO refactor with wait until
        // https://github.com/mozilla/gecko-dev/blob/master/devtools/client/shared/redux/middleware/wait-service.js
        // https://jlongster.com/Two-Weird-Tricks-with-Redux
        const runWhenScriptLoaded = () => {
          const state = store.getState()
          const { loaded, enabled } = state.integrations[NAMESPACE]
          const pageData = { ...getPageData(), ...data }
          const enrichedOptions = { ...state, ...{ options: options } }

          if (!enabled) {
            console.log('ABORT Page viw >>>>>', NAMESPACE, type)
            count = count + 1
            // all track calls complete
            if (pageCalls === pageCalls.length) {
              // Todo this logic is duplicated above in after abort
              pageCompleted(store, completed, cb)
            }
            return false
          }

          if (!loaded) {
            // TODO: set max try limit and add calls to local queue on fail
            if (timer > timeoutMax) {
              store.dispatch({
                type: EVENTS.PAGE_TIME_OUT,
                name: NAMESPACE
              })
              // TODO: save to queue
              return false
            }
            timer = timer + 10
            // TODO: set max try limit and add calls to local queue on fail
            setTimeout(runWhenScriptLoaded, 10)
            return false
          }

          /* Run .page dispatch once. Namespaced calls run below */
          if (!hasRan) {
            store.dispatch({
              type: EVENTS.PAGE,
              data: pageData,
              options: options
            })
            hasRan = true
          }

          /* run integration[x] .page function */
          provider.page(pageData, enrichedOptions, getState)

          /* Run Namespaced .page calls */
          store.dispatch({
            type: EVENTS.PAGE_NAMESPACE(NAMESPACE),
            data: pageData
          })

          // increment success counter
          count = count + 1
          completed = completed.concat(NAMESPACE)
          // all track calls complete
          if (count === pageCalls.length) {
            // dispatch completion event for middlewares
            pageCompleted(store, completed, cb)
          }
        }
        runWhenScriptLoaded()
      })
    }
    // resume
    return next(action)
  }
}

function pageCompleted(store, completed, cb) {
  // dispatch completion event for middlewares
  store.dispatch({
    type: EVENTS.PAGE_COMPLETE,
    ...{ integrations: completed }
  })
  if (cb) {
    cb(store)
  }
}
