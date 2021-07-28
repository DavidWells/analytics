import { uuid, paramsParse, dotProp } from 'analytics-utils'
import { get, set, remove } from '@analytics/global-storage-utils'
import { isBrowser, isFunction, isObject, isString } from '@analytics/type-utils'
import { createStore, combineReducers, applyMiddleware, compose } from './vendor/redux'
import * as CONSTANTS from './constants'
import { ID, ANONID, ERROR_URL } from './utils/internalConstants'
import EVENTS, { coreEvents, nonEvents, isReservedAction } from './events'
// Middleware
import * as middleware from './middleware'
import DynamicMiddleware from './middleware/dynamic'
// Modules
import pluginsMiddleware from './modules/plugins'
import track from './modules/track'
import queue from './modules/queue'
import page, { getPageData } from './modules/page'
import context, { makeContext } from './modules/context'
import user, { getUserPropFunc, tempKey, getPersistedUserData } from './modules/user'
// Utils
import { watch } from './utils/handleNetworkEvents'
import { Debug, composeWithDebug } from './utils/debug'
import heartBeat from './utils/heartbeat'
import ensureArray from './utils/ensureArray'
import enrichMeta from './utils/enrichMeta'

/**
 * Analytics library configuration
 *
 * After the library is initialized with config, the core API is exposed & ready for use in the application.
 *
 * @param {object} config - analytics core config
 * @param {string} [config.app] - Name of site / app
 * @param {string} [config.version] - Version of your app
 * @param {boolean} [config.debug] - Should analytics run in debug mode
 * @param {Array.<AnalyticsPlugin>}  [config.plugins] - Array of analytics plugins
 * @return {AnalyticsInstance} Analytics Instance
 * @example
 *
 * import Analytics from 'analytics'
 * import pluginABC from 'analytics-plugin-abc'
 * import pluginXYZ from 'analytics-plugin-xyz'
 *
 * // initialize analytics
 * const analytics = Analytics({
 *   app: 'my-awesome-app',
 *   plugins: [
 *     pluginABC,
 *     pluginXYZ
 *   ]
 * })
 *
 */
function analytics(config = {}) {
  const customReducers = config.reducers || {}
  const initialUser = config.initialUser || {}
  // @TODO add custom value reolvers for userId and anonId
  // const resolvers = config.resolvers || {}
  
  /* Parse plugins array */
  const parsedOptions = (config.plugins || []).reduce((acc, plugin) => {
    if (isFunction(plugin)) {
      /* Custom redux middleware */
      acc.middlewares = acc.middlewares.concat(plugin)
      return acc
    }
    // Legacy plugin with name
    if (plugin.NAMESPACE) plugin.name = plugin.NAMESPACE
    if (!plugin.name) {
      /* Plugins must supply a "name" property. See error url for more details */
      throw new Error(ERROR_URL + '1')
    }
    // if plugin exposes EVENTS capture available events
    const definedEvents = (plugin.EVENTS) ? Object.keys(plugin.EVENTS).map((k) => {
      return plugin.EVENTS[k]
    }) : []

    const enabledFromMerge = !(plugin.enabled === false)
    const enabledFromPluginConfig = !(plugin.config && plugin.config.enabled === false)
    // top level { enabled: false } takes presidence over { config: enabled: false }
    acc.pluginEnabled[plugin.name] = enabledFromMerge && enabledFromPluginConfig
    delete plugin.enabled

    if (plugin.methods) {
      acc.methods[plugin.name] = Object.keys(plugin.methods).reduce((a, c) => {
        // enrich methods with analytics instance
        a[c] = appendArguments(plugin.methods[c])
        return a
      }, {})
      // Remove additional methods from plugins
      delete plugin.methods
    }
    // Convert available methods into events
    const methodsToEvents = Object.keys(plugin)
    // Combine events
    const allEvents = methodsToEvents.concat(definedEvents)
    // Dedupe events list
    const allEventsUnique = new Set(acc.events.concat(allEvents))
    acc.events = Array.from(allEventsUnique)

    acc.pluginsArray = acc.pluginsArray.concat(plugin)

    if (acc.plugins[plugin.name]) {
      throw new Error(plugin.name + 'AlreadyLoaded')
    }
    acc.plugins[plugin.name] = plugin
    if (!acc.plugins[plugin.name].loaded) {
      // set default loaded func
      acc.plugins[plugin.name].loaded = () => true
    }
    return acc
  }, {
    plugins: {},
    pluginEnabled: {},
    methods: {},
    pluginsArray: [],
    middlewares: [],
    events: []
  })
  
  /* Storage by default is set to global & is not persisted */
  const storage = (config.storage) ? config.storage : {
    getItem: get,
    setItem: set,
    removeItem: remove
  }

  const getUserProp = getUserPropFunc(storage)

  // mutable intregrations object for dynamic loading
  let customPlugins = parsedOptions.plugins

  /* Grab all registered events from plugins loaded */
  const allPluginEvents = parsedOptions.events.filter((name) => {
    return !nonEvents.includes(name)
  }).sort()
  const uniqueEvents = new Set(allPluginEvents.concat(coreEvents).filter((name) => {
    return !nonEvents.includes(name)
  }))
  const allSystemEvents = Array.from(uniqueEvents).sort()

  /* plugin methods(functions) must be kept out of state. thus they live here */
  const getPlugins = () => customPlugins

  const {
    addMiddleware,
    removeMiddleware,
    dynamicMiddlewares
  } = new DynamicMiddleware()

  const nonAbortable = () => {
    // throw new Error(`${ERROR_URL}3`)
    throw new Error('Abort disabled inListener')
  }

  // Parse URL parameters
  const params = paramsParse()
  // Initialize visitor information
  const persistedUser = getPersistedUserData(storage)
  const visitorInfo = {
    ...persistedUser,
    ...initialUser,
    ...(!params.an_uid) ? {} : { userId: params.an_uid },
    ...(!params.an_aid) ? {} : { anonymousId: params.an_aid },
  }
  // If no anon id set, create one
  if (!visitorInfo.anonymousId) {
    visitorInfo.anonymousId = uuid()
  }

  /**
   * Async Management methods for plugins. 
   * 
   * This is also where [custom methods](https://bit.ly/329vFXy) are loaded into the instance.
   * @typedef {Object} Plugins
   * @property {EnablePlugin} enable - Set storage value
   * @property {DisablePlugin} disable - Remove storage value
   * @example
   *
   * // Enable a plugin by namespace
   * analytics.plugins.enable('keenio')
   *
   * // Disable a plugin by namespace
   * analytics.plugins.disable('google-analytics')
   */
  const plugins = {
    /**
     * Enable analytics plugin
     * @typedef {Function} EnablePlugin
     * @param  {String|Array} plugins - name of plugins(s) to disable
     * @param  {Function} [callback] - callback after enable runs
     * @returns {Promise}
     * @example
     *
     * analytics.plugins.enable('google-analytics').then(() => {
     *   console.log('do stuff')
     * })
     *
     * // Enable multiple plugins at once
     * analytics.plugins.enable(['google-analytics', 'segment']).then(() => {
     *   console.log('do stuff')
     * })
     */
    enable: (plugins, callback) => {
      return new Promise((resolve) => {
        store.dispatch({
          type: EVENTS.enablePlugin,
          plugins: ensureArray(plugins),
          _: { originalAction: EVENTS.enablePlugin },
        }, resolve, [ callback ])
      })
    },
    /**
     * Disable analytics plugin
     * @typedef {Function} DisablePlugin
     * @param  {String|Array} plugins - name of integration(s) to disable
     * @param  {Function} callback - callback after disable runs
     * @returns {Promise}
     * @example
     *
     * analytics.plugins.disable('google').then(() => {
     *   console.log('do stuff')
     * })
     *
     * analytics.plugins.disable(['google', 'segment']).then(() => {
     *   console.log('do stuff')
     * })
     */
    disable: (plugins, callback) => {
      return new Promise((resolve) => {
        store.dispatch({
          type: EVENTS.disablePlugin,
          plugins: ensureArray(plugins),
          _: { originalAction: EVENTS.disablePlugin },
        }, resolve, [callback])
      })
    },
    /*
     * Load registered analytic providers.
     * @param  {String} plugins - integration namespace
     *
     * @example
     * analytics.plugins.load('segment')
     @TODO implement
    load: (plugins) => {
      store.dispatch({
        type: EVENTS.loadPlugin,
        // Todo handle multiple plugins via array
        plugins: (plugins) ? [plugins] : Object.keys(getPlugins()),
      })
    },
    */
    /* @TODO if it stays, state loaded needs to be set. Re PLUGIN_INIT above
    add: (newPlugin) => {
      if (typeof newPlugin !== 'object') return false
      // Set on global integration object
      customPlugins = Object.assign({}, customPlugins, {
        [`${newPlugin.name}`]: newPlugin
      })
      // then add it, and init state key
      store.dispatch({
        type: EVENTS.pluginRegister,
        name: newPlugin.name,
        plugin: newPlugin
      })
    }, */
    // Merge in custom plugin methods
    ...parsedOptions.methods
  }
  
  /**
   * Analytic instance returned from initialization
   * @typedef {Object} AnalyticsInstance
   * @property {Identify} identify - Identify a user
   * @property {Track} track - Track an analytics event
   * @property {Page} page - Trigger page view
   * @property {User} user - Get user data
   * @property {Reset} reset - Clear information about user & reset analytics
   * @property {Ready} ready - Fire callback on analytics ready event
   * @property {On} on - Fire callback on analytics lifecycle events.
   * @property {Once} once - Fire callback on analytics lifecycle events once.
   * @property {GetState} getState - Get data about user, activity, or context.
   * @property {Storage} storage - storage methods
   * @property {Plugins} plugins - plugin methods
   */
  const instance = {
    /**
    * Identify a user. This will trigger `identify` calls in any installed plugins and will set user data in localStorage
    * @typedef {Function} Identify
    * @param  {String}   userId  - Unique ID of user
    * @param  {Object}   [traits]  - Object of user traits
    * @param  {Object}   [options] - Options to pass to identify call
    * @param  {Function} [callback] - Callback function after identify completes
    * @returns {Promise}
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
    * // Fire callback with 2nd or 3rd argument
    * analytics.identify('xyz-123', () => {
    *   console.log('do this after identify')
    * })
    *
    * // Disable sending user data to specific analytic tools
    * analytics.identify('xyz-123', {}, {
    *   plugins: {
    *     // disable sending this identify call to segment
    *     segment: false
    *   }
    * })
    *
    * // Send user data to only to specific analytic tools
    * analytics.identify('xyz-123', {}, {
    *   plugins: {
    *     // disable this specific identify in all plugins except customerio
    *     all: false,
    *     customerio: true
    *   }
    * })
    */
    identify: async (userId, traits, options, callback) => {
      const id = isString(userId) ? userId : null
      const data = isObject(userId) ? userId : traits
      const opts = options || {}
      const user = instance.user()

      /* sets temporary in memory id. Not to be relied on */
      set(tempKey(ID), id)

      const resolvedId = id || data.userId || getUserProp(ID, instance, data)

      return new Promise((resolve) => {
        store.dispatch({
          type: EVENTS.identifyStart,
          userId: resolvedId,
          traits: data || {},
          options: opts,
          anonymousId: user.anonymousId,
          // Add previousId if exists
          ...(user.id && (user.id !== id) && { previousId: user.id }),
        }, resolve, [traits, options, callback])
      })
    },
    /**
     * Track an analytics event. This will trigger `track` calls in any installed plugins
     * @typedef {Function} Track
     * @param  {String}   eventName - Event name
     * @param  {Object}   [payload]   - Event payload
     * @param  {Object}   [options]   - Event options
     * @param  {Function} [callback]  - Callback to fire after tracking completes
     * @returns {Promise}
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
     * // Fire callback with 2nd or 3rd argument
     * analytics.track('newsletterSubscribed', () => {
     *   console.log('do this after track')
     * })
     *
     * // Disable sending this event to specific analytic tools
     * analytics.track('cartAbandoned', {
     *   items: ['xyz', 'abc']
     * }, {
     *   plugins: {
     *     // disable track event for segment
     *     segment: false
     *   }
     * })
     *
     * // Send event to only to specific analytic tools
     * analytics.track('customerIoOnlyEventExample', {
     *   price: 11,
     *   sku: '1234'
     * }, {
     *   plugins: {
     *     // disable this specific track call all plugins except customerio
     *     all: false,
     *     customerio: true
     *   }
     * })
     */
    track: async (eventName, payload, options, callback) => {
      const name = isObject(eventName) ? eventName.event : eventName
      if (!name || !isString(name)) {
        throw new Error('EventMissing')
      }
      const data = isObject(eventName) ? eventName : (payload || {})
      const opts = isObject(options) ? options : {}

      return new Promise((resolve) => {
        store.dispatch({
          type: EVENTS.trackStart,
          event: name,
          properties: data,
          options: opts,
          userId: getUserProp(ID, instance, payload),
          anonymousId: getUserProp(ANONID, instance, payload),
        }, resolve, [payload, options, callback])
      })
    },
    /**
     * Trigger page view. This will trigger `page` calls in any installed plugins
     * @typedef {Function} Page
     * @param  {PageData} [data] - Page data overrides.
     * @param  {Object}   [options] - Page tracking options
     * @param  {Function} [callback] - Callback to fire after page view call completes
     * @returns {Promise}
     * @api public
     *
     * @example
     *
     * // Basic page tracking
     * analytics.page()
     *
     * // Page tracking with page data overrides
     * analytics.page({
     *   url: 'https://google.com'
     * })
     *
     * // Fire callback with 1st, 2nd or 3rd argument
     * analytics.page(() => {
     *   console.log('do this after page')
     * })
     *
     * // Disable sending this pageview to specific analytic tools
     * analytics.page({}, {
     *   plugins: {
     *     // disable page tracking event for segment
     *     segment: false
     *   }
     * })
     *
     * // Send pageview to only to specific analytic tools
     * analytics.page({}, {
     *   plugins: {
     *     // disable this specific page in all plugins except customerio
     *     all: false,
     *     customerio: true
     *   }
     * })
     */
    page: async (data, options, callback) => {
      const d = isObject(data) ? data : {}
      const opts = isObject(options) ? options : {}

      /*
      // @TODO add custom value reolvers for userId and anonId
      if (resolvers.getUserId) {
        const asyncUserId = await resolvers.getUserId()
        console.log('x', x)
      }
      */

      return new Promise((resolve) => {
        store.dispatch({
          type: EVENTS.pageStart,
          properties: getPageData(d),
          options: opts,
          userId: getUserProp(ID, instance, d),
          anonymousId: getUserProp(ANONID, instance, d),
        }, resolve, [data, options, callback])
      })
    },
    /**
     * Get user data
     * @typedef {Function} User
     * @param {string} [key] - dot.prop.path of user data. Example: 'traits.company.name'
     * @returns {string|object} value of user data or null
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
      if (key === ID || key === 'id') {
        return getUserProp(ID, instance)
      }
      if (key === ANONID || key === 'anonId') {
        return getUserProp(ANONID, instance)
      }
      const user = instance.getState('user')
      if (!key) return user
      return dotProp(user, key)
    },
    /**
     * Clear all information about the visitor & reset analytic state.
     * @typedef {Function} Reset
     * @param {Function} [callback] - Handler to run after reset
     * @returns {Promise}
     * @example
     *
     * // Reset current visitor
     * analytics.reset()
     */
    reset: (callback) => {
      return new Promise((resolve) => {
        store.dispatch({
          type: EVENTS.resetStart
        }, resolve, callback)
      })
    },
    /**
     * Fire callback on analytics ready event
     * @typedef {Function} Ready
     * @param  {Function} callback - function to trigger when all providers have loaded
     * @returns {DetachListeners} - Function to detach listener
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
     * @typedef {Function} On
     * @param  {String}   name - Name of event to listen to
     * @param  {Function} callback - function to fire on event
     * @return {DetachListeners} - Function to detach listener
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
      if (!name || !isFunction(callback)) {
        return false
      }
      if (name === EVENTS.bootstrap) {
        throw new Error('.on disabled for ' + name)
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
        addMiddleware(beforeHandler, before)
        addMiddleware(afterHandler, after)
        /**
         * Detach listeners
         * @typedef {Function} DetachListeners
         */
        return () => {
          removeMiddleware(beforeHandler, before)
          removeMiddleware(afterHandler, after)
        }
      }

      const position = (name.match(startRegex)) ? before : after // eslint-disable-line
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
     * @typedef {Function} Once
     * @param  {String} name - Name of event to listen to
     * @param  {Function} callback - function to fire on event
     * @return {DetachListeners} - Function to detach listener
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
      if (!name || !isFunction(callback)) {
        return false
      }
      if (name === EVENTS.bootstrap) {
        throw new Error('.once disabled for ' + name)
      }
      const detachListener = instance.on(name, ({ payload }) => {
        callback({ // eslint-disable-line
          payload: payload,
          instance: instance,
          plugins: customPlugins,
          abort: nonAbortable
        })
        // detach listener after its called once
        detachListener()
      })
      return detachListener
    },
    /**
     * Get data about user, activity, or context. Access sub-keys of state with `dot.prop` syntax.
     * @typedef {Function} GetState
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
    /*
     * Emit events for other plugins or middleware to react to.
     * @param  {Object} action - event to dispatch
     */
    dispatch: (action) => {
      const actionData = isString(action) ? { type: action } : action
      if (isReservedAction(actionData.type)) {
        throw new Error('reserved action ' + actionData.type)
      }
      const _private = action._ || {}
      // Dispatch actionStart
      // const autoPrefixType = `${actionData.type.replace(/Start$/, '')}Start`

      const dispatchData = {
        ...actionData,
        _: {
          originalAction: actionData.type,
          ..._private
        }
        // type: `${autoPrefixType}`
      }
      store.dispatch(dispatchData)
    },
    // Do not use. Will be removed. Here for Backwards compatiblity.
    // Moved to analytics.plugins.enable
    enablePlugin: plugins.enable,
    /// Do not use. Will be removed. Here for Backwards compatiblity.
    /// Moved to analytics.plugins.disable
    disablePlugin: plugins.disable,
    // Do not use. Will be removed. Here for Backwards compatiblity.
    // New plugins api
    plugins: plugins,
    /**
     * Storage utilities for persisting data.
     * These methods will allow you to save data in localStorage, cookies, or to the window.
     * @typedef {Object} Storage
     * @property {GetItem} getItem - Get value from storage
     * @property {SetItem} setItem - Set storage value
     * @property {RemoveItem} removeItem - Remove storage value
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
       * @typedef {Function} GetItem
       * @param {String} key - storage key
       * @param {Object} [options] - storage options
       * @return {Any}
       *
       * @example
       *
       * analytics.storage.getItem('storage_key')
       */
      getItem: storage.getItem,
      /**
       * Set storage value
       * @typedef {Function} SetItem
       * @param {String} key - storage key
       * @param {any} value - storage value
       * @param {Object} [options] - storage options
       *
       * @example
       *
       * analytics.storage.setItem('storage_key', 'value')
       */
      setItem: (key, value, options) => {
        store.dispatch({
          type: EVENTS.setItemStart,
          key: key,
          value: value,
          options: options
        })
      },
      /**
       * Remove storage value
       * @typedef {Function} RemoveItem
       * @param {String} key - storage key
       * @param {Object} [options] - storage options
       *
       * @example
       *
       * analytics.storage.removeItem('storage_key')
       */
      removeItem: (key, options) => {
        store.dispatch({
          type: EVENTS.removeItemStart,
          key: key,
          options: options
        })
      },
    },
    /*
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
      /* sets temporary in memory id. Not to be relied on */
      // set(tempKey(ANONID), anonymousId)
      instance.storage.setItem(CONSTANTS.ANON_ID, anonymousId, options)
    },
    /*
     * Events exposed by core analytics library and all loaded plugins
     * @type {Array}
     */
    events: {
      all: allSystemEvents,
      core: coreEvents,
      plugins: allPluginEvents,
      // byType: (type) => {} @Todo grab logic from engine and give inspectable events
    }
  }
  const enrichMiddleware = storeAPI => next => action => {
    if (!action.meta) {
      action.meta = enrichMeta()
    }
    return next(action)
  }
  const middlewares = parsedOptions.middlewares.concat([
    enrichMiddleware,
    /* Core analytics middleware */
    dynamicMiddlewares(before), // Before dynamic middleware <-- fixed pageStart .on listener
    /* Plugin engine */
    middleware.plugins(instance, getPlugins, {
      all: allSystemEvents,
      plugins: allPluginEvents
    }),
    middleware.storage(storage),
    middleware.initialize(instance),
    middleware.identify(instance, storage),
    /* after dynamic middleware */
    dynamicMiddlewares(after)
  ])

  /* Initial analytics state keys */
  const coreReducers = {
    context: context,
    user: user(storage),
    page: page,
    track: track,
    plugins: pluginsMiddleware(getPlugins),
    queue: queue
  }

  let composeEnhancers = compose
  let composeWithGlobalDebug = compose
  if (isBrowser && config.debug) {
    const devTools = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    if (devTools) {
      composeEnhancers = devTools({ trace: true, traceLimit: 25 })
    }
    composeWithGlobalDebug = function() {
      if (arguments.length === 0) return Debug()
      if (isObject(typeof arguments[0])) return composeWithDebug(arguments[0])
      return composeWithDebug().apply(null, arguments)
    }
  }

  const initialConfig = makeContext(config)

  const intialPluginState = parsedOptions.pluginsArray.reduce((acc, plugin) => {
    const { name, config, loaded } = plugin
    const isEnabled = parsedOptions.pluginEnabled[name]
    acc[name] = {
      enabled: isEnabled,
      // If plugin enabled & has no initialize method, set initialized to true, else false
      initialized: (isEnabled) ? Boolean(!plugin.initialize) : false,
      loaded: Boolean(loaded()),
      config: config || {}
    }
    return acc
  }, {})
  
  const initialState = {
    context: initialConfig,
    user: visitorInfo,
    plugins: intialPluginState,
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

  /* Supe up dispatch with callback promise resolver. Happens in enrichMeta */
  function enhanceDispatch(fn) {
    return function (event, resolver, callbacks) {
      // console.log('original event', event)
      const meta = enrichMeta(event.meta, resolver, ensureArray(callbacks))
      // if (resolver) console.log('dispatch resolver', resolver)
      // if (callbacks) console.log('dispatch callbacks', callbacks)
      const newEvent = { ...event, ...{ meta: meta } }
      // console.log('newEvent', newEvent)
      return fn.apply(null, [ newEvent ])
    }
  }

  // Automatically apply meta to dispatch calls
  store.dispatch = enhanceDispatch(store.dispatch)

  /* Synchronously call bootstrap & register Plugin methods */
  const pluginKeys = Object.keys(customPlugins)

  /* Bootstrap analytic plugins */
  store.dispatch({
    type: EVENTS.bootstrap,
    plugins: pluginKeys,
    config: initialConfig,
    params: params,
    user: visitorInfo,
    initialUser,
    persistedUser
  })

  const enabledPlugins = pluginKeys.filter((name) => parsedOptions.pluginEnabled[name])
  const disabledPlugins = pluginKeys.filter((name) => !parsedOptions.pluginEnabled[name])
 
  /* Register analytic plugins */
  store.dispatch({
    type: EVENTS.registerPlugins,
    plugins: pluginKeys,
    enabled: parsedOptions.pluginEnabled,
  })

  /* dispatch register for individual plugins */
  parsedOptions.pluginsArray.map((plugin, i) => {
    const { bootstrap, config, name } = plugin
    if (bootstrap && isFunction(bootstrap)) {
      bootstrap({ instance, config, payload: plugin })
    }
    /* Register plugins */
    store.dispatch({
      type: EVENTS.registerPluginType(name),
      name: name,
      enabled: parsedOptions.pluginEnabled[name],
      plugin: plugin
    })

    /* All plugins registered initialize, is last loop */
    if (parsedOptions.pluginsArray.length === (i + 1)) {
      store.dispatch({
        type: EVENTS.initializeStart,
        plugins: enabledPlugins,
        disabled: disabledPlugins
      })
    }
  })

  if (process.browser) {
    /* Watch for network events */
    watch((offline) => {
      store.dispatch({
        type: (offline) ? EVENTS.offline : EVENTS.online,
      })
    })
    /* Tick heartbeat for queued events */
    heartBeat(store, getPlugins, instance)
  }

  function appendArguments(fn) {
    return function () {
      /* Get original args */
      const args = Array.prototype.slice.call(arguments)
      /* Create clone of args */
      let newArgs = new Array(fn.length)
      for (let i = 0; i < args.length; i++) {
        newArgs[i] = args[i]
      }
      /* Append new arg to end */
      newArgs[newArgs.length] = instance
      // Set instance on extended methods
      return fn.apply({ instance }, newArgs)
    }
  }

  /* Return analytics instance */
  return instance
}

// Duplicated strings
const before = 'before'
const after = 'after'

export default analytics

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

export { CONSTANTS }
