import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { inBrowser } from 'analytics-utils'
import * as middleware from './middleware'
import plugins, { enablePlugin, disablePlugin } from './modules/plugins' // registerPlugin
import context, { makeContext } from './modules/context'
import page, { getPageData } from './modules/page'
import queue from './modules/queue'
import track from './modules/track'
import user, { reset } from './modules/user'
import dotProp from './utils/dotProp'
import timestamp from './utils/timestamp'
import { watch } from './utils/handleNetworkEvents'
import getCallback from './utils/getCallback'
import EVENTS, { eventKeys, isReservedAction } from './events'
// import heartBeat from './utils/heartbeat'
import * as CONSTANTS from './constants'

const isDev = process.env.NODE_ENV === 'development'

const { addMiddleware, removeMiddleware, setItem, removeItem, getItem } = middleware

export default function analytics(config = {}) {
  const customReducers = config.reducers || {}

  /* Parse plugins array */
  const parsedOptions = (config.plugins || []).reduce((acc, p) => {
    if (typeof p !== 'function' && p.NAMESPACE) {
      // Combine all available events
      const allEvents = new Set(acc.events.concat(Object.keys(p)))
      acc.events = Array.from(allEvents)

      if (acc.plugins[p.NAMESPACE]) {
        throw new Error(`Analytics "${p.NAMESPACE}" loaded twice!`)
      }
      acc.plugins[p.NAMESPACE] = p
      if (!acc.plugins[p.NAMESPACE].loaded) {
        // set default loaded func
        acc.plugins[p.NAMESPACE].loaded = () => { return true }
      }
      return acc
    }

    /* Custom redux middleware */
    acc.middlewares = acc.middlewares.concat(p)
    return acc
  }, {
    plugins: {},
    middlewares: [],
    events: []
  })

  // mutable intregrations object for dynamic loading
  let customPlugins = parsedOptions.plugins

  if (isDev || config.debug) {
    // console.log('All plugins', parsedOptions.plugins)
    // console.log('customMiddlewares', parsedOptions.middlewares)
  }

  const other = ['config', 'loaded', 'NAMESPACE']
  const registeredEvents = parsedOptions.events.concat(eventKeys).filter((name) => {
    return !other.includes(name)
  })
  const uniqueEventKeys = new Set(registeredEvents)
  const systemEvents = Array.from(uniqueEventKeys).sort()
  /* plugin methods(functions) must be kept out of state. thus they live here */
  const getPlugins = (asArray) => {
    if (asArray) {
      return Object.keys(customPlugins).map((plugin) => {
        return customPlugins[plugin]
      })
    }
    return customPlugins
  }

  const instance = {
    /**
     * Events exposed by core analytics library and all loaded plugins
     * @type {Array}
     */
    events: systemEvents,
    /**
    * Identify a user. This will trigger `identify` calls in any installed plugins and will set user data in localStorage
    * @param  {String}   userId  - Unique ID of user
    * @param  {Object}   traits  - Object of user traits
    * @param  {Object}   options - Options to pass to indentify call
    * @param  {Function} callback - Optional callback function after identify completes
    * @api public
    *
    * @example
    *
    * identify('xyz-123', {
    *   name: 'steve',
    *   company: 'hello-clicky'
    * })
    */
    identify: (userId, traits, options, callback) => {
      const id = (typeof userId === 'string') ? userId : null
      const data = (typeof userId === 'object') ? userId : traits
      const opts = options || {}
      const cb = getCallback(traits, options, callback)
      const user = instance.user()
      store.dispatch({
        type: EVENTS.identifyStart,
        userId: id,
        traits: data,
        options: opts,
        anonymousId: user.anonymousId,
        ...(user.id && (user.id !== id) && { previousId: user.id }),
        meta: {
          timestamp: timestamp(),
          ...(cb && { callback: cb })
        },
      })
    },
    /**
     * Track an analytics event. This will trigger `track` calls in any installed plugins
     * @param  {String}   eventName - Event name
     * @param  {Object}   payload   - Event payload
     * @param  {Object}   options   - Event options
     * @param  {Function} callback  - Callback to fire after tracking completes
     * @api public
     *
     * @example
     *
     * analytics.track('buttonClick')
     */
    track: (eventName, payload, options, callback) => {
      const name = (typeof eventName === 'object') ? eventName.event : eventName
      if (!name || typeof name !== 'string') {
        throw new Error('No eventName not supplied')
      }
      const data = (typeof eventName === 'object') ? eventName : (payload || {})
      const opts = (typeof options === 'object') ? options : {}
      const cb = getCallback(payload, options, callback)
      const { userId, anonymousId } = instance.user()
      store.dispatch({
        type: EVENTS.trackStart,
        event: name,
        properties: data,
        options: opts,
        userId: userId,
        anonymousId: anonymousId,
        meta: {
          timestamp: timestamp(),
          ...(cb && { callback: cb })
        },
      })
    },
    /**
     * Trigger page view. This will trigger `page` calls in any installed plugins
     * @param  {String}   data - (optional) page data
     * @param  {Object}   options   - Event options
     * @param  {Function} callback  - Callback to fire after page view call completes
     * @api public
     *
     * @example
     *
     * analytics.page()
     */
    page: (data, options, callback) => {
      const d = (typeof data === 'object') ? data : {}
      const opts = (typeof options === 'object') ? options : {}
      const cb = getCallback(data, options, callback)
      const { userId, anonymousId } = instance.user()
      store.dispatch({
        type: EVENTS.pageStart,
        properties: {
          ...getPageData(),
          ...d
        },
        options: opts,
        userId: userId,
        anonymousId: anonymousId,
        meta: {
          timestamp: timestamp(),
          ...(cb && { callback: cb })
        },
      })
    },
    /**
     * Get data about user, activity, or context. You can access sub-keys of state with `dot.prop` syntax.
     * @param  {String} key - (optional) dotprop sub value of state
     * @return {Any}
     *
     * @example
     *
     * // Get the current state of analytics
     * analytics.getState()
     *
     * // Get a subpath of state
     * analytics.getState('context.offline')
     */
    getState: (key) => {
      const state = store.getState()
      if (key) return dotProp(state, key)
      return Object.assign({}, state)
    },
    /**
     * Clear all information about the visitor & reset analytic state.
     * @param {Function} callback - Handler to run after reset
     */
    reset: (callback) => {
      store.dispatch(reset(callback))
    },
    /**
     * Emit events for other plugins or middleware to react to.
     * @param  {Object} action [description]
     */
    dispatch: (action) => {
      let theAction = action
      if (typeof action === 'string') {
        theAction = { type: action }
      }
      if (isReservedAction(action.type)) {
        console.log(`Trying to dispatch analytics reservedAction "${action.type}"`)
        return false
      }
      // Dispatch actionStart
      const autoPrefixType = `${theAction.type.replace(/Start$/, '')}Start`
      // TODO automatically add meta.timestamp
      store.dispatch({
        ...theAction,
        // TODO merge meta
        meta: {
          timestamp: timestamp()
        }
        // type: `${autoPrefixType}`
      })
    },
    /**
     * Storage utilities for persisting data. These methods will allow you to save data in localStorage, cookies, or to the window.
     * @type {Object}
     */
    storage: {
      /**
       * Get value from storage
       * @param {String} key - storage key
       * @param {Object} options - storage options
       * @return {Any}
       *
       * @example
       *
       * analytics.storage.getItem('storage_key')
       */
      getItem: getItem,
      /**
       * Set storage value
       * @param {String} key - storage key
       * @param {Any} value - storage value
       * @param {Object} options - storage options
       *
       * @example
       *
       * analytics.storage.setItem('storage_key', 'value')
       */
      setItem: (key, value, opts) => {
        store.dispatch(setItem(key, value, opts))
      },
      /**
       * Remove storage value
       * @param {String} key - storage key
       * @param {Object} options - storage options
       *
       * @example
       *
       * analytics.storage.removeItem('storage_key')
       */
      removeItem: (key, opts) => {
        store.dispatch(removeItem(key, opts))
      },
    },
    /*!
     * Set the anonymous ID of the visitor
     * @param {String} anonId - Id to set
     * @param {Object} options - storage options
     */
    setAnonymousId: (anonId, opts) => {
      instance.storage.setItem(CONSTANTS.ANON_ID, anonId, opts)
    },
    /**
     * Get user data
     * @param {String} key - dot.prop subpath of user data
     *
     * @example
     *
     * // get all user data
     * const userData = analytics.user()
     *
     * // get user company name
     * const companyName = analytics.user('company.name')
     */
    user: (key) => {
      const user = instance.getState('user')
      if (!key) return user
      return dotProp(user, key)
    },
    /**
     * Fire callback on analytics ready event
     * @param  {Function} callback - function to trigger when all providers have loaded
     *
     * @example
     *
     * analytics.ready((action, instance) => {
     *   console.log('all plugins have loaded')
     * })
     */
    ready: (callback) => {
      return instance.on(EVENTS.ready, callback)
    },
    /**
     * Attach an event handler function for one or more events to the selected elements.
     * @param  {String}   name - Name of event to listen to
     * @param  {Function} callback - function to fire on event
     * @return {Function} - Function to detach listener
     *
     * @example
     *
     * analytics.on('track', (action, instance) => {
     *   console.log('track call just happened. Do stuff')
     * })
     */
    on: (name, callback) => {
      if (!name || !callback || typeof callback !== 'function') {
        return false
      }

      const position = (name.match(/Start$/)) ? true : false // eslint-disable-line

      const handler = store => next => action => {
        // Subscribe to EVERYTHING
        if (name === '*') {
          callback({ action, instance }) // eslint-disable-line
        // Subscribe to specific actions
        } else if (action.type === name) {
          callback({ action, instance }) // eslint-disable-line
        }
        /* For future matching of event subpaths `track:*` etc
        } else if (name.match(/\*$/)) {
          const match = (name === '*') ? '.' : name
          const regex = new RegExp(`${match}`, 'g')
        } */
        return next(action)
      }
      addMiddleware(handler, position)
      return () => removeMiddleware(handler, position)
    },
    /**
     * Attach a handler function to an event and only trigger it only once.
     * @param  {String} name - Name of event to listen to
     * @param  {Function} callback - function to fire on event
     *
     * @example
     *
     * analytics.once('track', (action, instance) => {
     *   console.log('This will only triggered once')
     * })
     */
    once: (name, callback) => {
      const remove = instance.on(name, (action) => {
        callback(action, instance)
        remove()
      })
    },
    /**
     * Enable analytics plugin
     * @param  {String|Array} name - name of integration(s) to disable
     * @param  {Function} callback - callback after enable runs
     * @example
     *
     * analytics.enablePlugin('google')
     *
     * // enable multiple plugins at once
     * analytics.enablePlugin(['google', 'segment'])
     */
    enablePlugin: (name, callback) => {
      store.dispatch(enablePlugin(name, callback))
    },
    /**
     * Disable analytics plugin
     * @param  {string|array} name - name of integration(s) to disable
     * @param  {Function} callback - callback after disable runs
     * @example
     *
     * analytics.disablePlugin('google')
     *
     * analytics.disablePlugin(['google', 'segment'])
     */
    disablePlugin: (name, callback) => {
      store.dispatch(disablePlugin(name, callback))
    },
    /**
     * Load registered analytic providers.
     * @param  {String} namespace - integration namespace
     *
     * @example
     * analytics.loadPlugin('segment')
     */
    loadPlugin: (namespace) => {
      store.dispatch({
        type: EVENTS.pluginRegister,
        // todo handle arrays
        providers: (namespace) ? [namespace] : Object.keys(getPlugins()),
      })
    },
    /* @TODO if it stays, state loaded needs to be set. Re PLUGIN_INIT above
    addPlugin: (newPlugin) => {
      // validate integration
      if (typeof newPlugin !== 'object') {
        return false
      }
      // Set on global integration object
      customPlugins = Object.assign({}, customPlugins, {
        [`${newPlugin.NAMESPACE}`]: newPlugin
      })
      // then add it, and init state key
      store.dispatch({
        type: EVENTS.pluginRegister,
        name: newPlugin.NAMESPACE,
        plugin: newPlugin
      })
    }, */
  }

  const middlewares = parsedOptions.middlewares.concat([
    // Core analytics middleware
    middleware.dynamic(true), // Before dynamic middleware <-- fixed pageStart .on listener
    middleware.plugins(instance, getPlugins, systemEvents),
    middleware.storage(),
    middleware.initialize(instance),
    middleware.identify(instance),
    middleware.dynamic() // after dynamic middleware
  ])

  // Initial analytics state keys
  const coreReducers = {
    context: context,
    user: user,
    page: page,
    track: track,
    plugins: plugins,
    queue: queue
  }

  let composeEnhancers = compose
  if (inBrowser && config.debug) {
    const devTools = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    if (devTools) {
      composeEnhancers = devTools({ trace: true, traceLimit: 25 })
    }
  }

  const initialConfig = makeContext(config)
  const initialState = {
    context: initialConfig,
    // Todo allow for more userland defined initial state?
  }
  /* Create analytics store! */
  const store = createStore(
    // register reducers
    combineReducers({...coreReducers, ...customReducers}),
    // set user defined initial state
    initialState,
    // register middleware & plugins used
    composeEnhancers(applyMiddleware(...middlewares))
  )

  // Register plugins
  store.dispatch({
    type: EVENTS.bootstrap,
    plugins: Object.keys(customPlugins),
    config: initialConfig
  })

  // Register plugins
  store.dispatch({
    type: EVENTS.registerPlugins,
    plugins: Object.keys(customPlugins)
  })

  // Watch for network events
  watch(offline => {
    store.dispatch({
      type: (offline) ? EVENTS.offline : EVENTS.online,
    })
  })

  // heartBeat(store)

  /* Optionally expose redux to instance */
  if (config.exposeRedux) {
    // Add redux methods to instance
    return Object.assign({}, instance, {
      // enables full dispatcher
      dispatch: store.dispatch,
      subscribe: store.subscribe,
      replaceReducer: store.replaceReducer,
    })
  }

  return instance
}

export { analytics }
/**
 * Core Analytic events. These are exposed for third party plugins & listeners
 * Use these magic strings to attach functions to event names.
 * @type {Object}
 */
export { EVENTS }

/**
 * Core Analytic constants. These are exposed for third party plugins & listeners
 * @type {Object}
 */
export { CONSTANTS }
