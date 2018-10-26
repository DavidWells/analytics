import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { inBrowser } from 'analytics-utils'
import dynamicMiddlewares, { addMiddleware, removeMiddleware } from './middleware/dynamicMiddleware'
import initializeMiddleware from './middleware/initializeMiddleware'
import trackMiddleware from './middleware/track'
import pageMiddleware from './middleware/pageMiddleware'
import identifyMiddleware from './middleware/identifyMiddleware'
import context, { makeContext } from './modules/context'
import integrations from './modules/integrations'
import page, { pageView } from './modules/page'
import track, { trackEvent } from './modules/track'
import user, { identify } from './modules/user'
import EVENTS from './events'

const isDev = process.env.NODE_ENV === 'development'

// Only way commonJS will work
module.exports = (config) => {
  return analytics(config)
}

function analytics(config = {}) {
  const plugins = config.plugins || []
  const customReducers = config.reducers || {}

  /* Custom analytic integrations */
  let customIntegrations = plugins.reduce((obj, p) => {
    if (typeof p !== 'function' && p.NAMESPACE) {
      obj[p.NAMESPACE] = p
      return obj
    }
    return obj
  }, {})

  /* Custom redux middleware */
  const customMiddlewares = plugins.reduce((arr, p) => {
    if (typeof p === 'function') {
      return arr.concat(p)
    }
    return arr
  }, [])

  if (isDev) {
    console.log('customIntegrations', customIntegrations)
    console.log('customMiddlewares', customMiddlewares)
  }

  /* plugin methods(functions) must be kept out of state. thus they live here */
  const getIntegrations = () => {
    return customIntegrations
  }

  const middlewares = customMiddlewares.concat([
    // core middlewares
    initializeMiddleware,
    identifyMiddleware(getIntegrations),
    trackMiddleware(getIntegrations),
    pageMiddleware(getIntegrations),
    dynamicMiddlewares,
  ])

  // initial analytics state keys
  const coreReducers = {
    context: context,
    user: user,
    page: page,
    track: track,
    integrations: integrations
  }

  let composeEnhancers = compose
  if (inBrowser) {
    const withDevTools = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
    composeEnhancers = (isDev) ? withDevTools : compose
  }

  /* Create analytics store! */
  const store = createStore(
    combineReducers({...coreReducers, ...customReducers}),
    // optional default config overides by user
    {
      context: makeContext(config),
    },
    // register middleware & plugins used
    composeEnhancers(
      applyMiddleware(...middlewares)
    )
  )

  // Init analytics
  store.dispatch({
    type: EVENTS.INITIALIZE
  })

  // Register, load, and onReady custom integrations
  const providers = Object.keys(customIntegrations)

  providers.forEach((int, i) => {
    const provider = customIntegrations[int]

    store.dispatch({
      type: EVENTS.REGISTER_INTEGRATION,
      name: provider.NAMESPACE,
      integration: provider
    })

    // initialize integrations
    if (provider && provider.initialize) {
      // load scripts etc.
      provider.initialize(provider.config)

      // run check for loaded here and then dispatch loaded events
      if (provider.loaded && typeof provider.loaded === 'function') {
        checkForScriptReady({ maxRetries: 1000 }, store, provider)
      }
    }
  })

  // No providers found. Trigger ready listeners
  if (!providers.length) {
    setTimeout(() => {
      store.dispatch({
        type: EVENTS.READY
      })
    }, 0)
  }

  if (isDev) {
    console.log('intialize state', store.getState())
  }

  return {
    // Get all state or state by key
    getState: (key) => {
      const state = store.getState()
      if (key) {
        // TODO add dot notation and grab deeper values
        return state[key]
      }
      return state
    },
    dispatch: store.dispatch,
    subscribe: store.subscribe,
    replaceReducer: store.replaceReducer,
    // track custom event
    track: (eventName, payload, options, callback) => {
      store.dispatch(
        trackEvent(eventName, payload, options, callback)
      )
      /* Note promise will return before tracking complete. */
      return Promise.resolve()
    },
    // trigger page view
    page: (data, options, callback) => {
      store.dispatch(
        pageView(data, options, callback)
      )
      /* Note promise will return before tracking complete. */
      return Promise.resolve()
    },
    // set user data
    identify: (userId, data, options, callback) => {
      store.dispatch(
        identify(userId, data, options, callback)
      )
      /* Note promise will return before tracking complete. */
      return Promise.resolve()
    },
    // get user data
    user: () => {
      // TODO add key to input and allow for pulling back specific values
      return store.getState().user
    },
    // analtyics.ready all integrations ready
    ready: (cb) => {
      const callback = typeof cb === 'function' ? cb : false
      if (!callback) return false
      const readyMiddleware = store => next => action => {
        if (action.type === EVENTS.READY) {
          callback(action, store)
        }
        return next(action)
      }
      addMiddleware(readyMiddleware)
      return () => removeMiddleware(readyMiddleware)
    },
    /* USE .on WITH GREAT CAUTION */
    on: (name, cb) => {
      const callback = typeof cb === 'function' ? cb : false
      if (!callback) return false
      // Subscribe to EVERYTHING
      if (name === '*') {
        /* // store subscribe works but won't give current action context
          return store.subscribe(() => {
            callback(action, store)
          })
        */
        const globalListener = store => next => action => {
          // do something on every action *
          callback(action, store)
          return next(action)
        }
        // will add middleware to existing chain
        addMiddleware(globalListener)
        // calling this will destroy listener & remove middleware
        return () => {
          removeMiddleware(globalListener)
        }
      }
      const listener = store => next => action => {
        if (action.type === name) {
          // TODO finalize values passed back
          callback(action, store)
        }
        return next(action)
      }
      // will add middleware to existing chain
      addMiddleware(listener)
      // calling this will destroy listener & remove middleware
      return () => {
        removeMiddleware(listener)
      }
    },
    // TODO decide if this is good or bad ⊂◉‿◉つ. Exposing publicly could be bad
    addIntegration: function(t) {
      // TODO if it stays, state loaded needs to be set. Re REGISTER_INTEGRATION above
      // validate integration
      if (typeof t === 'object') {
        const newIntergration = {}
        newIntergration[t.NAMESPACE] = t
        customIntegrations = {
          ...customIntegrations,
          ...newIntergration
        }
        console.log('add new integration dynamically', customIntegrations)
      }
      // then add it, and init state key
      store.dispatch({
        type: EVENTS.REGISTER_INTEGRATION,
        name: t.NAMESPACE,
        integration: t
      })
    }
  }
}

// Check for script loaded on page then dispatch actions
function checkForScriptReady(config, store, provider, retryCount) {
  retryCount = retryCount || 0
  const maxRetries = config.maxRetries

  if (retryCount > maxRetries) {
    store.dispatch({
      type: EVENTS.INTEGRATION_FAILED,
      name: provider.NAMESPACE
    })
    store.dispatch({
      type: `integration_failed:${provider.NAMESPACE}`
    })
    return false
  }

  // check if loaded
  if (!provider.loaded() && retryCount <= maxRetries) {
    setTimeout(() => {
      checkForScriptReady(config, store, provider, ++retryCount)
    }, 10)
    return false
  }

  // script isLoaded, dispatch generic event
  store.dispatch({
    type: EVENTS.INTEGRATION_LOADED,
    name: provider.NAMESPACE
  })

  // dispatch namespaced event
  store.dispatch({
    type: `integration_ready:${provider.NAMESPACE}`
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

/*
// Reduce once for both sets of data
const customIntegrations = plugins.reduce((obj, p) => {
  console.log('arr', obj)
  if (typeof p !== 'function') {
    obj.integration[p.NAMESPACE] = p
    return obj
  }
  obj.middleware = obj.middleware.concat(p)
  return obj
}, {
  middleware: [],
  integration: {}
})
*/
