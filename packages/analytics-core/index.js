import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { inBrowser } from 'analytics-utils'
import * as middleware from './middleware'
import integrations, { enableIntegration, disableIntegration } from './modules/integrations'
import context, { makeContext } from './modules/context'
import page, { pageView } from './modules/page'
import track, { trackEvent } from './modules/track'
import user, { identify } from './modules/user'
import dotProp from './utils/dotProp'
import { watch } from './utils/handleNetworkEvents'
import { mouseOut, tabHidden } from './utils/handleTabEvents'
import EVENTS, { reservedActions } from './events'
import getCallback from './utils/getCallback'

const isDev = process.env.NODE_ENV === 'development'

const { addMiddleware, removeMiddleware } = middleware

// Only way commonJS will work
module.exports = function analytics(config = {}) {
  const customReducers = config.reducers || {}

  /* Parse plugins array */
  const plugins = (config.plugins || []).reduce((acc, p) => {
    if (typeof p !== 'function') {
      /* analytic integrations */
      acc.integrations[p.NAMESPACE] = p
      return acc
    }
    /* Custom redux middleware */
    acc.middlewares = acc.middlewares.concat(p)
    return acc
  }, {
    middlewares: [],
    integrations: {}
  })

  // mutable intregrations object for dynamic loading
  let customIntegrations = plugins.integrations

  if (isDev) {
    console.log('customIntegrations', plugins.integrations)
    console.log('customMiddlewares', plugins.middlewares)
  }

  /* plugin methods(functions) must be kept out of state. thus they live here */
  const getIntegrations = () => {
    return customIntegrations
  }

  // getState helper with dotprop
  const getState = (key) => {
    const state = store.getState()
    if (key) {
      return dotProp(state, key)
    }
    return Object.assign({}, state)
  }

  const instance = getState
  instance.getState = getState
  instance.dispatch = (action) => {
    if (reservedActions.includes(action.type)) {
      console.log(`Trying to dispatch analytics reservedAction "${action.type}"`)
      return false
    }
    store.dispatch(action)
  }

  // Combine all middleware
  const middlewares = plugins.middlewares.concat([
    // Core analytics middleware
    middleware.initialize,
    middleware.integration(getIntegrations, instance),
    middleware.identify(getIntegrations, instance),
    middleware.track(getIntegrations, instance),
    middleware.page(getIntegrations, instance),
    middleware.dynamic,
  ])

  // Initial analytics state keys
  const coreReducers = {
    context: context,
    user: user,
    page: page,
    track: track,
    integrations: integrations
  }

  let composeEnhancers = compose
  if (inBrowser && config.debug) {
    const withDevTools = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
    composeEnhancers = (isDev) ? withDevTools : compose
  }

  /* Create analytics store! */
  const store = createStore(
    combineReducers({...coreReducers, ...customReducers}),
    // optional default config overides by user
    {
      context: makeContext(config),
      // Todo allow for more userland defined initial state?
    },
    // register middleware & plugins used
    composeEnhancers(
      applyMiddleware(...middlewares)
    )
  )

  // Init analytics
  store.dispatch({
    type: EVENTS.INITIALIZE,
    providers: Object.keys(customIntegrations),
  })

  // // Register, load, and onReady custom integrations
  store.dispatch({
    type: EVENTS.INTEGRATION_INIT,
    providers: Object.keys(customIntegrations),
  })

  // Watch for network events
  const networkWatcher = bool => {
    store.dispatch({
      type: (bool) ? EVENTS.OFFLINE : EVENTS.ONLINE,
    })
  }
  watch(networkWatcher)

  const windowWatcher = bool => {
    store.dispatch({
      type: (bool) ? EVENTS.WINDOW_LEAVE : EVENTS.WINDOW_ENTER,
    })
  }
  mouseOut(windowWatcher)

  const tabWatcher = bool => {
    store.dispatch({
      type: (bool) ? EVENTS.TAB_HIDDEN : EVENTS.TAB_VISIBLE,
    })
  }
  tabHidden(tabWatcher)

  const api = {
    // Get all state or state by key
    getState: getState,
    dispatch: store.dispatch,
    subscribe: store.subscribe,
    replaceReducer: store.replaceReducer,
    // track custom event
    /**
     * Track an analytics event
       @example
       track('buttonClick', {

        })

       @param {String} html string to be escaped
       @return {String} escaped html
       @api public
     */
    track: (eventName, payload, options, callback) => {
      store.dispatch(
        trackEvent(eventName, payload, options, callback)
      )
      /* Note promise will return before tracking complete. */
      return Promise.resolve()
    },
    // trigger page view
    page: (data, options, callback) => {
      const d = data || {}
      store.dispatch(
        pageView(d, options, callback)
      )
      /* Note promise will return before tracking complete. */
      return Promise.resolve()
    },
    /**
    * Identify user
    * @param  {String}   userId  - Unique ID of user
    * @param  {Object}   traits  - Object of user traits
    * @param  {Object}   options - Options to pass to indentify call
    * @param  {Function} callback - Optional callback function after identify completes
    * @return {Promise}
    *
    * @example
    *
    *  identify('xyz-123', {
    *    name: 'steve',
    *    company: 'hello-clicky'
    *  })
    */
    identify: (userId, traits, options, callback) => {
      const id = (typeof userId === 'string') ? userId : null
      const data = (typeof userId === 'object') ? userId : traits
      store.dispatch(
        identify(id, data, options, callback)
      )
      /* Note promise will return before tracking complete. */
      return Promise.resolve()
    },
    /**
     * Get user data
     * @param  {string} key - dot.prop subpath of user data
     * @example
     *
     * user()
     *
     * // get subpath
     * user('company.name')
     */
    user: (key) => {
      const user = getState('user')
      if (!key) return user
      return dotProp(user, key)
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
      /* For future matching of event subpaths `track*`
      if (name.match(/\*$/)) {
        const match = (name === '*') ? '.' : name
        const regex = new RegExp(`${match}`, 'g')
      }
      */
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
    /**
     * Enable analytics integration
     * @param  {string|array} name - name of integration(s) to disable
     * @param  {Function} callback - callback after enable runs
     * @example
     *
     * enableIntegration('google')
     *
     * // enable multiple integrations at once
     * enableIntegration(['google', 'segment'])
     */
    enableIntegration: (name, callback) => {
      store.dispatch(enableIntegration(name, callback))
    },
    /**
     * Disable analytics integration
     * @param  {string|array} name - name of integration(s) to disable
     * @param  {Function} callback - callback after disable runs
     * @example
     *
     * disableIntegration('google')
     *
     * disableIntegration(['google', 'segment'])
     */
    disableIntegration: (name, callback) => {
      store.dispatch(disableIntegration(name, callback))
    },
    load: () => {
      store.dispatch({
        type: EVENTS.INTEGRATION_INIT,
        providers: Object.keys(getIntegrations()),
      })
    },
    addIntegration: (newIntegration) => {
      // TODO if it stays, state loaded needs to be set. Re INTEGRATION_INIT above
      // validate integration
      if (typeof newIntegration !== 'object') {
        return false
      }
      // Set on global integration object
      customIntegrations = Object.assign({}, customIntegrations, {
        [`${newIntegration.NAMESPACE}`]: newIntegration
      })
      // then add it, and init state key
      store.dispatch({
        type: EVENTS.INTEGRATION_INIT,
        name: newIntegration.NAMESPACE,
        integration: newIntegration
      })
    }
  }

  return api
}
