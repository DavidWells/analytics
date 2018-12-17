import EVENTS from '../events'
import runHooks from '../utils/runHooks'

export default function pluginMiddleware(instance, getPlugins) {
  return store => next => action => {
    const { type, name, callback } = action
    let updatedAction = action
    // Dyanmically run registered plugin methods
    if (type && type !== 'track' && type !== 'page' && type !== 'identify') {
      if (action.abort) return next(action)
      const value = runHooks(action, instance, getPlugins())
      if (value) {
        // A plugin has modifed the original action
        updatedAction = value
      }
    }

    if (type === EVENTS.DISABLE_PLUGIN || type === EVENTS.ENABLE_PLUGIN) {
      // TODO run initialize if not loaded
      if (callback) {
        callback(name)
      }
    }

    // respond to analytics.loadPlugin('xyz')
    // Attempts to run `initialize` method again
    if (type === EVENTS.PLUGIN_INIT) {
      const providers = action.providers
      providers.forEach((name) => {
        const provider = getPlugins()
        loadPlugin(provider[name], store, instance)
      })
    }

    // TODO instead of listening to PLUGIN_INIT listen to INTEGRATION like TRACK. This way these calls can be aborted by middleware
    if (type === EVENTS.INITIALIZE) {
      const allPlugins = getPlugins()
      const initCalls = Object.keys(allPlugins).reduce((arr, plugin) => {
        return arr.concat(allPlugins[plugin])
      }, [])
      const { plugins } = store.getState()

      // No providers found. Trigger ready listeners
      if (!initCalls.length) {
        store.dispatch({
          type: EVENTS.READY
        })
        return next(action)
      }

      initCalls.filter((provider) => {
        const current = plugins[provider.NAMESPACE]
        if (!current) {
          // not loaded yet, try initialize
          return true
        }
        // Only try and load analytic scripts once
        return current && current.loaded === false
      }).forEach((provider, i) => {
        loadPlugin(provider, store, instance)
      })
    }

    return next(updatedAction)
  }
}

function loadPlugin(provider, store, instance) {
  const { NAMESPACE } = provider

  store.dispatch({
    type: EVENTS.PLUGIN_INIT_TYPE(NAMESPACE),
    name: NAMESPACE,
    integration: provider
  })

  const hasLoadedLogic = provider.loaded
  const isLoaded = provider.loaded && typeof provider.loaded === 'function' && provider.loaded()
  if (!hasLoadedLogic) {
    // console.log('NO loaded method found for', provider)
    // Emit loaded there is no waiting for this
    if (provider.initialize) {
      provider.initialize(provider.config, instance)
    }
    integrationLoaded(NAMESPACE, store)
  } else if (!isLoaded) {
    // run check for loaded here and then dispatch loaded events
    // Run initialize method in analytics provider
    if (provider.initialize) {
      provider.initialize(provider.config, instance)
    }
    checkForScriptReady({ maxRetries: 1000 }, store, provider, instance)
  }
}

function integrationLoaded(NAMESPACE, store) {
  // dispatch namespaced event
  store.dispatch({
    type: EVENTS.PLUGIN_LOADED_TYPE(NAMESPACE),
    name: NAMESPACE
  })
}

// Check for script loaded on page then dispatch actions
function checkForScriptReady(config, store, provider, instance, retryCount) {
  retryCount = retryCount || 0
  const maxRetries = config.maxRetries
  const { NAMESPACE } = provider
  if (retryCount > maxRetries) {
    store.dispatch({
      type: EVENTS.PLUGIN_FAILED,
      name: NAMESPACE
    })
    store.dispatch({
      type: EVENTS.PLUGIN_FAILED_TYPE(NAMESPACE),
      name: NAMESPACE
    })
    return false
  }

  // Run initialize method in analytics provider
  if (provider.initialize) {
    provider.initialize(provider.config, instance)
  }

  // check if loaded
  if (!provider.loaded() && retryCount <= maxRetries) {
    setTimeout(() => {
      // Retry until loaded
      checkForScriptReady(config, store, provider, instance, ++retryCount)
    }, 10)
    return false
  }

  // dispatch namespaced event
  integrationLoaded(NAMESPACE, store)

  // dispatch ready when all plugins load
  const { plugins } = store.getState()
  const everythingLoaded = Object.keys(plugins).reduce((acc, curr) => {
    if (!plugins[curr].loaded) {
      return false
    }
    return acc
  }, true)

  if (everythingLoaded) {
    // all plugins loaded. do stuff
    store.dispatch({
      type: EVENTS.READY
    })
  }
}
