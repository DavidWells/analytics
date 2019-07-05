import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { inBrowser } from 'analytics-utils'
import * as middleware from './middleware'
import DynamicMiddleware from './middleware/dynamic'
import plugins, { enablePlugin, disablePlugin } from './modules/plugins'
import context, { makeContext } from './modules/context'
import page, { getPageData } from './modules/page'
import track from './modules/track'
import queue from './modules/queue'
import user, { reset, getUserProp, tempKey, getPersistedUserData } from './modules/user'
import dotProp from './utils/dotProp'
import timestamp from './utils/timestamp'
import { watch } from './utils/handleNetworkEvents'
import getCallback from './utils/getCallback'
import { Debug, composeWithDebug } from './utils/debug'
import EVENTS, { coreEvents, nonEvents, isReservedAction } from './events'
import * as CONSTANTS from './constants'
import globalContext from './utils/global'
import heartBeat from './utils/heartbeat'

const { setItem, removeItem, getItem } = middleware

/**
  * Analytics library
  * @param {object} config - analytics core config
  * @param {string} [config.app] - Name of site / app
  * @param {string} [config.version] - Version of your app
  * @param {array}  [config.plugins] - Array of analytics plugins
  * @return {object} Analytics Instance
  * @example
  *
  * import Analytics from 'analytics'
  *
  * // initialize analytics
  * const analytics = Analytics({
  *   app: 'my-awesome-app',
  *   plugins: [
  *     ...importedPlugins
  *   ]
  * })
  *
  */
export default function analytics(config = {}) {
  const customReducers = config.reducers || {}

  /* Parse plugins array */
  const parsedOptions = (config.plugins || []).reduce((acc, p) => {
    if (typeof p !== 'function' && p.NAMESPACE) {
      // if plugin exposes EVENTS capture available events
      const definedEvents = (p.EVENTS) ? Object.keys(p.EVENTS).map((k) => {
        return p.EVENTS[k]
      }) : []
      // Convert available methods into events
      const methodsToEvents = Object.keys(p)
      // Combine events
      const allEvents = methodsToEvents.concat(definedEvents)
      // Dedupe events list
      const allEventsUnique = new Set(acc.events.concat(allEvents))
      acc.events = Array.from(allEventsUnique)

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

  /* Grab all registered events from plugins loaded */
  const pluginEvents = parsedOptions.events.filter((name) => {
    return !nonEvents.includes(name)
  })
  const uniqueEvents = new Set(pluginEvents.concat(coreEvents).filter((name) => {
    return !nonEvents.includes(name)
  }))
  const allSystemEvents = Array.from(uniqueEvents).sort()
  const allPluginEvents = pluginEvents.sort()

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

  const nonAbortable = () => { throw new Error('Abort not allowed from listener') }

  const instance = {
    /**
    * Identify a user. This will trigger `identify` calls in any installed plugins and will set user data in localStorage
    * @param  {String}   userId  - Unique ID of user
    * @param  {Object}   [traits]  - Object of user traits
    * @param  {Object}   [options] - Options to pass to identify call
    * @param  {Function} [callback] - Callback function after identify completes
    * @api public
    *
    * @example
    *
    * // Basic user id identify
    * analytics.identify('xyz-123')
    *
    * // Identify with additional traits
    * analytics.identify('xyz-123', {
    *   name: 'steve',
    *   company: 'hello-clicky'
    * })
    *
    * // Disable identify for specific plugin
    * analytics.identify('xyz-123', {}, {
    *  plugins: {
    *    // disable for segment plugin
    *    segment: false
    *  }
    * })
    *
    * // Fire callback with 2nd or 3rd argument
    * analytics.identify('xyz-123', () => {
    *   console.log('do this after identify')
    * })
    */
    identify: (userId, traits, options, callback) => {
      const id = (typeof userId === 'string') ? userId : null
      const data = (typeof userId === 'object') ? userId : traits
      const opts = options || {}
      const cb = getCallback(traits, options, callback)
      const user = instance.user()

      /* sets temporary in memory id. Not to be relied on */
      globalContext[tempKey('userId')] = id

      const resolvedId = id || data.userId || getUserProp('userId', instance, data)

      store.dispatch({
        type: EVENTS.identifyStart,
        userId: resolvedId,
        traits: data || {},
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
     * @param  {Object}   [payload]   - Event payload
     * @param  {Object}   [options]   - Event options
     * @param  {Function} [callback]  - Callback to fire after tracking completes
     * @api public
     *
     * @example
     *
     * // Basic event tracking
     * analytics.track('buttonClicked')
     *
     * // Event tracking with payload
     * analytics.track('itemPurchased', {
     *   price: 11,
     *   sku: '1234'
     * })
     *
     * // Disable specific plugin on track
     * analytics.track('cartAbandoned', {
     *   items: ['xyz', 'abc']
     * }, {
     *  plugins: {
     *    // disable track event for segment
     *    segment: false
     *  }
     * })
     *
     * // Fire callback with 2nd or 3rd argument
     * analytics.track('newsletterSubscribed', () => {
     *   console.log('do this after track')
     * })
     */
    track: (eventName, payload, options, callback) => {
      const name = (typeof eventName === 'object') ? eventName.event : eventName
      if (!name || typeof name !== 'string') {
        throw new Error('EventName not supplied')
      }
      const data = (typeof eventName === 'object') ? eventName : (payload || {})
      const opts = (typeof options === 'object') ? options : {}
      const cb = getCallback(payload, options, callback)

      const id = getUserProp('userId', instance, payload)
      const anonId = getUserProp('anonymousId', instance, payload)

      store.dispatch({
        type: EVENTS.trackStart,
        event: name,
        properties: data,
        options: opts,
        userId: id,
        anonymousId: anonId,
        meta: {
          timestamp: timestamp(),
          ...(cb && { callback: cb })
        },
      })
    },
    /**
     * Trigger page view. This will trigger `page` calls in any installed plugins
     * @param  {String}   [data] - Page data overrides.
     * @param  {Object}   [options] - Page tracking options
     * @param  {Function} [callback] - Callback to fire after page view call completes
     * @api public
     *
     * @example
     *
     * // Basic page tracking
     * analytics.page()
     *
     * // Page tracking with page data overides
     * analytics.page({
     *   url: 'https://google.com'
     * })
     *
     * // Disable specific plugin page tracking
     * analytics.page({}, {
     *  plugins: {
     *    // disable page tracking event for segment
     *    segment: false
     *  }
     * })
     *
     * // Fire callback with 1st, 2nd or 3rd argument
     * analytics.page(() => {
     *   console.log('do this after page')
     * })
     */
    page: (data, options, callback) => {
      const d = (typeof data === 'object') ? data : {}
      const opts = (typeof options === 'object') ? options : {}
      const cb = getCallback(data, options, callback)

      const userId = getUserProp('userId', instance, d)
      const anonymousId = getUserProp('anonymousId', instance, d)

      store.dispatch({
        type: EVENTS.pageStart,
        properties: getPageData(d),
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
     * Get user data
     * @param {String} [key] - dot.prop.path of user data. Example: 'traits.company.name'
     * @returns {any} value of user data or null
     *
     * @example
     *
     * // Get all user data
     * const userData = analytics.user()
     *
     * // Get user id
     * const userId = analytics.user('userId')
     *
     * // Get user company name
     * const companyName = analytics.user('traits.company.name')
     */
    user: (key) => {
      if (key === 'userId' || key === 'id') {
        const findId = getUserProp('userId', instance)
        return findId
      }

      const user = instance.getState('user')

      if (!key) return user
      return dotProp(user, key)
    },
    /**
     * Clear all information about the visitor & reset analytic state.
     * @param {Function} [callback] - Handler to run after reset
     *
     * @example
     *
     * // Reset current visitor
     * analytics.reset()
     */
    reset: (callback) => {
      store.dispatch(reset(callback))
    },
    /**
     * Fire callback on analytics ready event
     * @param  {Function} callback - function to trigger when all providers have loaded
     * @returns {Function} - Function to detach listener
     *
     * @example
     *
     * analytics.ready() => {
     *   console.log('all plugins have loaded or were skipped', payload)
     * })
     */
    ready: (callback) => {
      return instance.on(EVENTS.ready, callback)
    },
    /**
     * Attach an event handler function for analytics lifecycle events.
     * @param  {String}   name - Name of event to listen to
     * @param  {Function} callback - function to fire on event
     * @return {Function} - Function to detach listener
     *
     * @example
     *
     * // Fire function when 'track' calls happen
     * analytics.on('track', ({ payload }) => {
     *   console.log('track call just happened. Do stuff')
     * })
     *
     * // Remove listener before it is called
     * const removeListener = analytics.on('track', ({ payload }) => {
     *   console.log('This will never get called')
     * })
     *
     * // cleanup .on listener
     * removeListener()
     */
    on: (name, callback) => {
      if (!name || !callback || typeof callback !== 'function') {
        return false
      }
      if (name === 'bootstrap') {
        throw new Error(`Listeners not allowed for ${name}`)
      }
      const startRegex = /Start$|Start:/
      if (name === '*') {
        const beforeHandler = store => next => action => {
          if (action.type.match(startRegex)) {
            callback({ // eslint-disable-line
              payload: action,
              instance,
              plugins: customPlugins
            })
          }
          return next(action)
        }
        const afterHandler = store => next => action => {
          if (!action.type.match(startRegex)) {
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

      const position = (name.match(startRegex)) ? 'before' : 'after' // eslint-disable-line
      const handler = store => next => action => {
        // Subscribe to EVERYTHING
        if (action.type === name) {
          callback({ // eslint-disable-line
            payload: action,
            instance: instance,
            plugins: customPlugins,
            abort: nonAbortable
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
     * @return {Function} - Function to detach listener
     *
     * @example
     *
     * // Fire function only once 'track'
     * analytics.once('track', ({ payload }) => {
     *   console.log('This will only triggered once when analytics.track() fires')
     * })
     *
     * // Remove listener before it is called
     * const listener = analytics.once('track', ({ payload }) => {
     *   console.log('This will never get called b/c listener() is called')
     * })
     *
     * // cleanup .once listener before it fires
     * listener()
     */
    once: (name, callback) => {
      if (!name || !callback || typeof callback !== 'function') {
        return false
      }
      const listener = instance.on(name, ({ payload }) => {
        callback({ // eslint-disable-line
          payload: payload,
          instance: instance,
          plugins: customPlugins,
          abort: nonAbortable
        })
        // detach listener after its called once
        listener()
      })
      return listener
    },
    /**
     * Get data about user, activity, or context. Access sub-keys of state with `dot.prop` syntax.
     * @param  {string} [key] - dot.prop.path value of state
     * @return {any}
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
    /*!
     * Emit events for other plugins or middleware to react to.
     * @param  {Object} action - event to dispatch
     */
    dispatch: (action) => {
      const actionData = (typeof action === 'string') ? { type: action } : action
      if (isReservedAction(actionData.type)) {
        throw new Error(`Trying to dispatch analytics reservedAction "${actionData.type}"`)
      }
      const meta = actionData.meta || {}
      const _private = action._ || {}
      // Dispatch actionStart
      // const autoPrefixType = `${theAction.type.replace(/Start$/, '')}Start`

      const dispatchData = {
        ...actionData,
        meta: {
          timestamp: timestamp(),
          ...meta,
        },
        _: {
          originalAction: actionData.type,
          ..._private
        }
        // type: `${autoPrefixType}`
      }

      store.dispatch(dispatchData)
    },
    /**
     * Enable analytics plugin
     * @param  {String|Array} plugins - name of plugins(s) to disable
     * @param  {Function} [callback] - callback after enable runs
     * @example
     *
     * analytics.enablePlugin('google')
     *
     * // Enable multiple plugins at once
     * analytics.enablePlugin(['google', 'segment'])
     */
    enablePlugin: (plugins, callback) => {
      store.dispatch(enablePlugin(plugins, callback))
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
    /*!
     * Load registered analytic providers.
     * @param  {String} namespace - integration namespace
     *
     * @example
     * analytics.loadPlugin('segment')
     */
    loadPlugin: (namespace) => {
      store.dispatch({
        type: EVENTS.loadPlugin,
        // Todo handle multiple plugins via array
        plugins: (namespace) ? [namespace] : Object.keys(getPlugins()),
      })
    },
    /**
     * Storage utilities for persisting data.
     * These methods will allow you to save data in localStorage, cookies, or to the window.
     * @type {Object}
     *
     * @example
     *
     * // Pull storage off analytics instance
     * const { storage } = analytics
     *
     * // Get value
     * storage.getItem('storage_key')
     *
     * // Set value
     * storage.setItem('storage_key', 'value')
     *
     * // Remove value
     * storage.removeItem('storage_key')
     */
    storage: {
      /**
       * Get value from storage
       * @param {String} key - storage key
       * @param {Object} [options] - storage options
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
       * @param {any} value - storage value
       * @param {Object} [options] - storage options
       *
       * @example
       *
       * analytics.storage.setItem('storage_key', 'value')
       */
      setItem: (key, value, options) => {
        store.dispatch(setItem(key, value, options))
      },
      /**
       * Remove storage value
       * @param {String} key - storage key
       * @param {Object} [options] - storage options
       *
       * @example
       *
       * analytics.storage.removeItem('storage_key')
       */
      removeItem: (key, options) => {
        store.dispatch(removeItem(key, options))
      },
    },
    /*!
     * Set the anonymous ID of the visitor
     * @param {String} anonymousId - anonymous Id to set
     * @param {Object} [options] - storage options
     *
     * @example
     *
     * // Set anonymous ID
     * analytics.setAnonymousId('1234567')
     */
    setAnonymousId: (anonymousId, options) => {
      instance.storage.setItem(CONSTANTS.ANON_ID, anonymousId, options)
    },
    /*!
     * Events exposed by core analytics library and all loaded plugins
     * @type {Array}
     */
    events: {
      all: allSystemEvents,
      core: coreEvents,
      plugins: allPluginEvents,
      // byType: (type) => {} @Todo grab logic from engine and give inspectable events
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
    /* Core analytics middleware */
    dynamicMiddlewares('before'), // Before dynamic middleware <-- fixed pageStart .on listener
    /* Plugin engine */
    middleware.plugins(instance, getPlugins, {
      all: allSystemEvents,
      plugins: allPluginEvents
    }),
    middleware.storage(),
    middleware.initialize(instance),
    middleware.identify(instance),
    /* after dynamic middleware */
    dynamicMiddlewares('after')
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
        // If plugin has no initialize method, set initialized to true
        initialized: (!plugin.initialize) ? true : false, // eslint-disable-line
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
    combineReducers({ ...coreReducers, ...customReducers }),
    // set user defined initial state
    initialState,
    // register middleware & plugins used
    composeWithGlobalDebug(
      composeEnhancers(
        applyMiddleware(...middlewares),
      )
    )
  )

  /* Synchronously call bootstrap & register Plugin methods */
  const pluginKeys = Object.keys(customPlugins)

  /* Bootstrap analytic plugins */
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

  parsedOptions.pluginsArray.map((plugin, i) => { // eslint-disable-line
    const { bootstrap, config } = plugin
    if (bootstrap && typeof bootstrap === 'function') {
      bootstrap({ instance, config, payload: plugin })
    }
    const lastCall = plugins.length === (i + 1)
    /* Register plugins */
    store.dispatch({
      type: EVENTS.registerPluginType(plugin.NAMESPACE),
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

  if (process.browser) {
    /* Watch for network events */
    watch(offline => {
      store.dispatch({
        type: (offline) ? EVENTS.offline : EVENTS.online,
      })
    })

    /* Tick heartbeat for queued events */
    heartBeat(store, getPlugins, instance)
  }

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

/*
 * analytics.init exported for standalone browser build
 * CDN build exposes global _analytics variable
 *
 * Initialize instance with _analytics.init() or _analytics['default']()
 */
export { analytics as init }

/*
 * analytics.Analytics exported for node usage
 *
 * Initialize instance with _analytics.init() or _analytics['default']()
 */
export { analytics as Analytics }
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
