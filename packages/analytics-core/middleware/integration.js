import EVENTS from '../events'
import getIntegrationByMethod from '../utils/getIntegrationByMethod'

export default function integrationMiddleware(getIntegrations, instance) {
  return store => next => action => {
    const { type, name, callback } = action
    if (type === EVENTS.DISABLE_INTEGRATION || type === EVENTS.ENABLE_INTEGRATION) {
      if (callback) {
        callback(name)
      }
    }

    // TODO instead of listening to INTEGRATION_INIT listen to INTEGRATION like TRACK. This way these calls can be aborted by middleware
    if (type === EVENTS.INTEGRATION_INIT) {
      const initCalls = getIntegrationByMethod('initialize', getIntegrations())
      const { integrations } = store.getState()

      // No providers found. Trigger ready listeners
      if (!initCalls.length) {
        store.dispatch({
          type: EVENTS.READY
        })
        return next(action)
      }

      initCalls.filter((provider) => {
        const current = integrations[provider.NAMESPACE]
        if (!current) {
          // not loaded yet, try initialize
          return true
        }
        // Only try and load analytic scripts once
        return current && current.loaded === false
      }).forEach((provider, i) => {
        const { NAMESPACE } = provider

        store.dispatch({
          type: EVENTS.INTEGRATION_NAMESPACE(NAMESPACE),
          name: NAMESPACE,
          integration: provider
        })

        // run check for loaded here and then dispatch loaded events
        if (provider.loaded && typeof provider.loaded === 'function' && !provider.loaded()) {
          // Run initialize method in analytics provider
          provider.initialize(provider.config, instance)
          checkForScriptReady({ maxRetries: 1000 }, store, provider, instance)
        }
      })
    }

    return next(action)
  }
}

// Check for script loaded on page then dispatch actions
function checkForScriptReady(config, store, provider, instance, retryCount) {
  retryCount = retryCount || 0
  const maxRetries = config.maxRetries
  const { NAMESPACE } = provider
  if (retryCount > maxRetries) {
    store.dispatch({
      type: EVENTS.INTEGRATION_FAILED,
      name: NAMESPACE
    })
    store.dispatch({
      type: EVENTS.INTEGRATION_FAILED_NAME(NAMESPACE),
      name: NAMESPACE
    })
    return false
  }

  // Run initialize method in analytics provider
  provider.initialize(provider.config, instance)

  // check if loaded
  if (!provider.loaded() && retryCount <= maxRetries) {
    setTimeout(() => {
      // Retry until loaded
      checkForScriptReady(config, store, provider, instance, ++retryCount)
    }, 10)
    return false
  }

  // dispatch namespaced event
  store.dispatch({
    type: EVENTS.INTEGRATION_LOADED_NAME(NAMESPACE),
    name: NAMESPACE
  })

  // dispatch ready when all integrations load
  const { integrations } = store.getState()
  const everythingLoaded = Object.keys(integrations).reduce((acc, curr) => {
    if (!integrations[curr].loaded) {
      return false
    }
    return acc
  }, true)

  if (everythingLoaded) {
    // all integrations loaded. do stuff
    store.dispatch({
      type: EVENTS.READY
    })
  }
}
