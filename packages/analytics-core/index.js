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
import { tabHidden } from './utils/handleTabEvents'
import { mouseOut } from './utils/handleWindowEvents'
import EVENTS, { reservedActions } from './events'
import * as CONSTANTS from './constants'

const isDev = process.env.NODE_ENV === 'development'

const {
  addMiddleware,
  removeMiddleware,
  setItem,
  removeItem,
  getItem
} = middleware

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

  /**
   * getState helper with dotprop
   * @param  {[type]} key [description]
   * @return {[type]}     [description]
   */
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
  // Storage utils
  instance.getItem = getItem
  instance.setItem = (key, value) => {
    store.dispatch(setItem(key, value))
  }
  instance.removeItem = (key, value) => {
    store.dispatch(removeItem(key))
  }

  const middlewares = plugins.middlewares.concat([
    // Core analytics middleware
    middleware.storage(),
    middleware.initialize(instance),
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

  // Register, load, and onReady custom integrations
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
    /**
     * Get current analytics state, user data, & context
     * @type {Object}
     */
    getState: getState,
    dispatch: store.dispatch,
    subscribe: store.subscribe,
    replaceReducer: store.replaceReducer,
    setItem: instance.setItem,
    removeItem: instance.removeItem,
    /**
     * Track an analytics event
     * @param  {String}   eventName - Event name
     * @param  {Object}   payload   - Event payload
     * @param  {Object}   options   - Event options
     * @param  {Function} callback  - Callback to fire after tracking completes
     * @return {Promise}
     * @api public
     *
     * @Example
     *
     * track('buttonClick')
     */
    track: (eventName, payload, options, callback) => {
      store.dispatch(
        trackEvent(eventName, payload, options, callback)
      )
      /* Note promise will return before tracking complete. */
      return Promise.resolve()
    },
    /**
     * Trigger page view
     * @param  {String}   data - (optional) page data
     * @param  {Object}   options   - Event options
     * @param  {Function} callback  - Callback to fire after page view call completes
     * @return {Promise}
     * @api public
     *
     * @Example
     *
     * page()
     */
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
     * // get all user data
     * const userData = analytics.user()
     *
     * // get user company name
     * const companyName = analytics.user('company.name')
     */
    user: (key) => {
      const user = getState('user')
      if (!key) return user
      return dotProp(user, key)
    },
    // analtyics.ready all integrations ready
    ready: (callback) => {
      if (!callback || typeof callback !== 'function') {
        return false
      }
      const readyMiddleware = store => next => action => {
        if (action.type === EVENTS.READY) {
          callback(action, instance)
        }
        return next(action)
      }
      addMiddleware(readyMiddleware)
      return () => removeMiddleware(readyMiddleware)
    },
    /**
     * Attach event listeners to analytic events
     * @param  {String}   name  - event name to listen for
     * @param  {Function} callback - callback function to trigger on event
     * @return {Function} unsubcribe function for listener
     */
    on: (name, callback) => {
      if (!name || !callback || typeof callback !== 'function') {
        return false
      }
      // Subscribe to EVERYTHING
      if (name === '*') {
        const globalListener = store => next => action => {
          callback(action, instance)
          return next(action)
        }
        // add middleware to existing chain
        addMiddleware(globalListener)
        // return remove middleware function
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
          callback(action, instance)
        }
        return next(action)
      }
      // add middleware to existing chain
      addMiddleware(listener)
      // return remove middleware function
      return () => {
        removeMiddleware(listener)
      }
    },
    /**
     * Load registered analytic providers.
     */
    load: () => {
      store.dispatch({
        type: EVENTS.INTEGRATION_INIT,
        providers: Object.keys(getIntegrations()),
      })
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

/**
 * Expose available events for third party plugins & listeners
 * @type {Object}
 */
module.exports.EVENTS = EVENTS

/**
 * Expose available constants for third party plugins & listeners
 * @type {Object}
 */
module.exports.CONSTANTS = CONSTANTS
