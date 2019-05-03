import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { inBrowser } from 'analytics-utils'
import * as middleware from './middleware'
import DynamicMiddleware from './middleware/dynamic'
import plugins, { enablePlugin, disablePlugin } from './modules/plugins'
import context, { makeContext } from './modules/context'
import page, { getPageData } from './modules/page'
import track from './modules/track'
import queue from './modules/queue'
import user, { reset, getPersistedUserData } from './modules/user'
import dotProp from './utils/dotProp'
import timestamp from './utils/timestamp'
import { watch } from './utils/handleNetworkEvents'
import getCallback from './utils/getCallback'
import { Debug, composeWithDebug } from './utils/debug'
import EVENTS, { eventKeys, isReservedAction } from './events'
import * as CONSTANTS from './constants'
import heartBeat from './utils/heartbeat'

const { setItem, removeItem, getItem } = middleware

export default function analytics(config = {}) {
  const customReducers = config.reducers || {}

  /* Parse plugins array */
  const parsedOptions = (config.plugins || []).reduce((acc, p) => {
    if (typeof p !== 'function' && p.NAMESPACE) {
      // Combine all available events
      const allEvents = new Set(acc.events.concat(Object.keys(p)))
      acc.events = Array.from(allEvents)

      acc.pluginsArray = acc.pluginsArray.concat(p)

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
    pluginsArray: [],
    middlewares: [],
    events: []
  })

  // mutable intregrations object for dynamic loading
  let customPlugins = parsedOptions.plugins
  const pluginKeys = Object.keys(customPlugins)

  const nonEvents = ['config', 'loaded', 'NAMESPACE']
  const registeredEvents = parsedOptions.events.concat(eventKeys).filter((name) => {
    return !nonEvents.includes(name)
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

  const { addMiddleware, removeMiddleware, dynamicMiddlewares } = new DynamicMiddleware()

  const instance = {
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
      // @TODO extract userID logic into reusable function
      const finUserId = id || getPersistedUserData().userId

      store.dispatch({
        type: EVENTS.identifyStart,
        userId: finUserId,
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
        throw new Error(`Trying to dispatch analytics reservedAction "${action.type}"`)
        // return false
      }
      // Dispatch actionStart
      // const autoPrefixType = `${theAction.type.replace(/Start$/, '')}Start`
      // TODO automatically add meta.timestamp

      let dispatchData = {
        ...theAction,
        // TODO merge meta
        meta: {
          timestamp: timestamp()
        }
        // type: `${autoPrefixType}`
      }

      if (theAction.meta) {
        dispatchData = {
          ...dispatchData,
          meta: {
            ...dispatchData.meta,
            ...theAction.meta,
            // ...(dispatchData.meta.timestamp ? { timestamp: dispatchData.meta.timestamp } : {})
          }
        }
      }

      store.dispatch(dispatchData)
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
     * // get user id
     * const userId = analytics.user('userId')
     *
     * // get user company name
     * const companyName = analytics.user('traits.company.name')
     */
    user: (key) => {
      const persistedUser = getPersistedUserData()
      const user = instance.getState('user')
      // TODO sync persisted data with state
      // console.log('xxx user', user)
      // console.log('xxx user persistedUser', persistedUser)

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
     * analytics.on('track', ({ action, instance }) => {
     *   console.log('track call just happened. Do stuff')
     * })
     */
    on: (name, callback) => {
      if (!name || !callback || typeof callback !== 'function') {
        return false
      }
      if (name === 'bootstrap') {
        throw new Error('Not allowed to listen to bootstrap')
      }

      if (name === '*') {
        const beforeHandler = store => next => action => {
          if (action.type.match(/Start$|Start:/)) {
            callback({ // eslint-disable-line
              payload: action,
              instance,
              plugins: customPlugins
            })
          }
          return next(action)
        }
        const afterHandler = store => next => action => {
          if (!action.type.match(/Start$|Start:/)) {
            callback({ // eslint-disable-line
              payload: action,
              instance,
              plugins: customPlugins
            })
          }
          return next(action)
        }
        addMiddleware(beforeHandler, 'before')
        addMiddleware(afterHandler, 'after')
        return () => {
          removeMiddleware(beforeHandler, 'before')
          removeMiddleware(afterHandler, 'after')
        }
      }

      const position = (name.match(/Start$|Start:/)) ? 'before' : 'after' // eslint-disable-line
      const handler = store => next => action => {
        // Subscribe to EVERYTHING
        if (action.type === name) {
          callback({ // eslint-disable-line
            payload: action,
            instance: instance,
            plugins: customPlugins
          })
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
     * @param  {String|Array} name - name of integration(s) to disable
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
        type: EVENTS.loadPlugin,
        // todo handle arrays
        plugins: (namespace) ? [namespace] : Object.keys(getPlugins()),
      })
    },
    /**
     * Events exposed by core analytics library and all loaded plugins
     * @type {Array}
     */
    events: systemEvents,
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
    /* Core analytics middleware */
    dynamicMiddlewares('before'), // Before dynamic middleware <-- fixed pageStart .on listener
    middleware.plugins(instance, getPlugins, systemEvents),
    middleware.storage(),
    middleware.initialize(instance),
    middleware.identify(instance),
    dynamicMiddlewares('after') // after dynamic middleware
  ])

  /* Initial analytics state keys */
  const coreReducers = {
    context: context,
    user: user,
    page: page,
    track: track,
    plugins: plugins(getPlugins),
    queue: queue
  }

  let composeEnhancers = compose
  let composeWithGlobalDebug = compose
  if (inBrowser && config.debug) {
    const devTools = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    if (devTools) {
      composeEnhancers = devTools({ trace: true, traceLimit: 25 })
    }
    composeWithGlobalDebug = function() {
      if (arguments.length === 0) return Debug()
      if (typeof arguments[0] === 'object') return composeWithDebug(arguments[0])
      return composeWithDebug().apply(null, arguments)
    }
  }

  const initialConfig = makeContext(config)
  const initialUser = getPersistedUserData()
  // console.log('initialUser', initialUser)
  const initialState = {
    context: initialConfig,
    user: initialUser,
    plugins: parsedOptions.pluginsArray.reduce((acc, plugin) => {
      const { NAMESPACE, config, loaded } = plugin
      acc[NAMESPACE] = {
        enabled: true,
        initialized: false,
        loaded: Boolean(loaded()),
        config: config || {}
      }
      return acc
    }, {}),
    // Todo allow for more userland defined initial state?
  }
  /* Create analytics store! */
  const store = createStore(
    // register reducers
    combineReducers({...coreReducers, ...customReducers}),
    // set user defined initial state
    initialState,
    // register middleware & plugins used
    composeWithGlobalDebug(
      composeEnhancers(
        applyMiddleware(...middlewares),
      )
    )
  )

  // Syncronously call bootstrap & register Plugin methods

  /* Bootstap analytic plugins */
  store.dispatch({
    type: EVENTS.bootstrap,
    plugins: pluginKeys,
    config: initialConfig
  })

  /* Register analytic plugins */
  store.dispatch({
    type: EVENTS.registerPlugins,
    plugins: pluginKeys,
  })

  parsedOptions.pluginsArray.map((plugin, i) => {
    const { bootstrap, config } = plugin
    if (bootstrap && typeof bootstrap === 'function') {
      bootstrap({ instance, config, payload: plugin })
    }
    const lastCall = plugins.length === (i + 1)
    /* Register plugins */
    store.dispatch({
      type: `registerPlugin:${plugin.NAMESPACE}`, // EVENTS.pluginRegisterType(NAMESPACE),
      name: plugin.NAMESPACE,
      plugin: plugin
    })

    /* All plugins registered initialize */
    if (lastCall) {
      store.dispatch({
        type: EVENTS.initializeStart,
        plugins: pluginKeys
      })
    }
  })

  // Watch for network events
  watch(offline => {
    store.dispatch({
      type: (offline) ? EVENTS.offline : EVENTS.online,
    })
  })

  heartBeat(store, getPlugins)

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
/*
 * Core Analytic events. These are exposed for third party plugins & listeners
 * Use these magic strings to attach functions to event names.
 * @type {Object}
 */
export { EVENTS }

/*
 * Core Analytic constants. These are exposed for third party plugins & listeners
 * @type {Object}
 */
export { CONSTANTS }
