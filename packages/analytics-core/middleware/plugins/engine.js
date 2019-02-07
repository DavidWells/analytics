import getPluginByMethod from '../../utils/getPluginByMethod'
import filterDisabled from '../../utils/filterDisabled'
import waitForReady from '../../utils/waitForReady'
// import Queue from '../../utils/queue'
import EVENTS from '../../events'

/* Actions */
const AbortAction = (method, name) => `${method}Aborted:${name}`
const AbortAllAction = (method) => `${method}Aborted`
const NameSpacedAction = (coreEvent, pluginName) => `${coreEvent}:${pluginName}`
const EndAction = (method) => `${method}End`

export default function engine(action, instance, plugins, store, systemEvents) {
  const { meta } = action
  const eventType = action.type
  if (eventType === EVENTS.enablePlugin || eventType === EVENTS.disablePlugin) {
    // @TODO reset function cache
    // cache = {}
  }
  /* If action already dispatched exit early */
  if (meta && meta.called) {
    // This makes it so plugin methods dont get fired twice.
    return action
  }

  /* certain plugins shouldnt dispatch again to avoid infinite  */
  let shouldDispatch = eventType.match(/Start$/)

  let beforeMethods = []
  let methodToCall = eventType
  let completed = []
  let queued = []
  let aborted = []

  if (eventType.match(/Start$/)) {
    beforeMethods = getPluginByMethod(eventType, plugins)
    methodToCall = eventType.replace(/Start$/, '')
  }

  /*  */
  let allPluginMethodCalls = getPluginByMethod(methodToCall, plugins)

  /* We must register all plugins */
  if (methodToCall === 'registerPlugin') {
    allPluginMethodCalls = Object.keys(plugins).map((name) => {
      return plugins[name]
    })
  }

  const allPluginKeys = allPluginMethodCalls.map((plugin) => plugin.NAMESPACE)
  /* make args for functions to concume */
  const makeArgs = argumentFactory(instance, allPluginKeys)
  /* Grab current state to check if plugins are enabled */
  const state = instance.getState()
  /* Filter out currently disabled plugins */
  const activeBeforeMethods = filterDisabled(beforeMethods, state.plugins, action.options)

  /* All ‘blankStart’ calls get processed */
  const actionBefore = activeBeforeMethods.reduce((newAction, plugin) => {
    const { NAMESPACE } = plugin
    // Call methods. Only called 'actionStart'
    let pluginReturnValue = newAction
    if (plugin[eventType] && typeof plugin[eventType] === 'function') {
      const funcArgs = makeArgs(newAction, plugin)
      /* Call the plugin function */
      const returnValue = plugin[eventType](funcArgs)

      if (returnValue && typeof returnValue === 'object') {
        pluginReturnValue = Object.assign({}, returnValue, { type: newAction.type })
        validateReturnValue(newAction.type, pluginReturnValue.type, eventType, NAMESPACE)
      }

      store.dispatch({
        ...pluginReturnValue,
        type: NameSpacedAction(eventType, NAMESPACE),
        meta: {
          ...pluginReturnValue.meta,
          called: true
        },
      })
    }
    return Object.assign({}, newAction, pluginReturnValue)
  }, action)
  // console.log('Action value: actionBefore', actionBefore)

  /* newActionValue contains abort. Stop everything else */
  if (shouldDispatch && shouldAbortAll(actionBefore, allPluginKeys.length)) {
    store.dispatch({
      type: `${methodToCall}Aborted`,
      abort: actionBefore.abort,
    })
    return actionBefore
  }

  // 🔥 @TODO do we want to emit an aborted event if { plugins: { vanilla: false }}
  let activePlugins = filterDisabled(allPluginMethodCalls, state.plugins, action.options)

  const allNameSpacedCalls = activePlugins.reduce((acc, plugin) => {
    const { NAMESPACE } = plugin
    // `typeStart:pluginName`
    const nameSpacedActionStart = NameSpacedAction(eventType, NAMESPACE)
    // `type:pluginName`
    const nameSpacedAction = NameSpacedAction(methodToCall, NAMESPACE)
    // Length of action name. A.k.a how many colons :
    const actionDepth = (nameSpacedAction.match(/:/g) || []).length

    /* Ignore 'action:plugin:other-plugin' calls */
    if (actionDepth > 1) {
      return acc
    }
    /* Look for hookStart:xyz & hook:xyz */
    let beforeFuncs = []
    if (nameSpacedAction !== nameSpacedActionStart) {
      /* get matching plugin[action + Start] functions */
      beforeFuncs = getPluginByMethod(nameSpacedActionStart, plugins).map((p) => {
        return {
          event: nameSpacedActionStart,
          NAMESPACE: p.NAMESPACE,
          func: p[nameSpacedActionStart]
        }
      })
    }
    /* get matching plugin[action] functions */
    const foundFuncs = getPluginByMethod(nameSpacedAction, plugins).map((p) => {
      return {
        event: nameSpacedAction,
        NAMESPACE: p.NAMESPACE,
        func: p[nameSpacedAction]
      }
    })
    /* combine before funcs & namespaced functions */
    const combinedFunctionsToRun = beforeFuncs.concat(foundFuncs)
    if (combinedFunctionsToRun.length) {
      acc[NAMESPACE] = combinedFunctionsToRun
    }
    return acc
  }, {})

  /* EventPayloads are cached and passed through the chain for plugin specific calls */
  let eventPayloads = {}

  /* Loop over active plugins & call all matching plugin methods */
  const nameSpacedAction = activePlugins.reduce((newAction, plugin) => {
    const { NAMESPACE } = plugin
    if (shouldAbort(newAction, NAMESPACE)) {
      if (shouldDispatch) {
        store.dispatch({
          type: AbortAction(methodToCall, NAMESPACE),
          abort: newAction.abort,
        })
      }

      // @TODO Append to aborted array here
      aborted = addToArray(aborted, NAMESPACE)
      return newAction
    }

    /* Loop over ‘method:{PluginName}’ functions and derive new action value */
    const methods = allNameSpacedCalls[NAMESPACE]
    if (methods) {
      const nameSpacedAction = methods.reduce((accum, nsPlugin) => {
        const SUB_NAMESPACE = nsPlugin.NAMESPACE
        /* If abort and abort matches the plugin name. exit early */
        if (shouldAbort(accum, NAMESPACE)) {
          // if (state.context.debug) {
          //   console.log(`"${nsPlugin.event}" method not called in ${nsPlugin.pluginName} plugin.`)
          //   console.log(`Reason: abort("${accum.reason}") from "${accum.caller}" plugin`)
          // }
          return accum
        }

        let pluginReturnValue = {}
        if (nsPlugin.func && typeof nsPlugin.func === 'function') {
          /* check for namespaced called of same plugin name */
          validateMethod(nsPlugin.event, SUB_NAMESPACE)

          const payload = accum
          const functionArgs = makeArgs(payload, plugin, nsPlugin) // <== needs nsPlugin for correct abort traces
          /* Call plugin method */
          const returnValue = nsPlugin.func(functionArgs)

          if (returnValue && typeof returnValue === 'object') {
            pluginReturnValue = Object.assign({}, returnValue, { type: accum.type })
            validateReturnValue(accum.type, pluginReturnValue.type, nsPlugin.event, SUB_NAMESPACE)
            // pluginReturnValue = returnValue
          }
        }

        if (shouldAbort(pluginReturnValue, NAMESPACE)) {
          // @todo check array for name? maybe not bc u can only abort your namespace
          if (shouldDispatch) {
            store.dispatch({
              type: AbortAction(methodToCall, NAMESPACE),
              abort: pluginReturnValue.abort,
            })
          }
          // @TODO Append to aborted array here
          aborted = addToArray(aborted, NAMESPACE)
          /* Aborted return early. Seems to be working */
          return pluginReturnValue
        }
        const combine = Object.assign({}, accum, pluginReturnValue)
        // console.log(`ABORTED= ${eventType} ${plugin.NAMESPACE}`, combine)
        return combine
      }, newAction)

      /* `name:method` Abort() was called. Exit early */
      if (shouldAbort(nameSpacedAction, NAMESPACE)) {
        // console.log('nameSpacedAction.abort', nameSpacedAction.abort)
        // alert(`abort ${plugin.NAMESPACE}.${methodToCall} now`)
        return Object.assign({}, newAction, nameSpacedAction)
      }

      if (nameSpacedAction && typeof nameSpacedAction === 'object') {
        /* Save plugin specific action payload. (If plugins have altered a specific call) */
        eventPayloads[NAMESPACE] = Object.assign({}, nameSpacedAction)
        // Return original action so we don't modify all calls
        return newAction // <--- Object.assign({}, theAction, nameSpacedAction)
      }
    }

    /* Save payload for specific calls */
    eventPayloads[NAMESPACE] = Object.assign({}, newAction)

    return newAction
  }, actionBefore)

  /**
   * Filter over the plugin method calls and remove aborted plugin by name
   */
  const coreMethodsToCall = activePlugins.filter((plugin) => {
    if (shouldAbort(nameSpacedAction, plugin.NAMESPACE)) {
      aborted = addToArray(aborted, plugin.NAMESPACE)
      return false
    }
    return true
  })

  /*
  console.log(`>>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━(type:${eventType})<<`)
  console.log(`>>(Event:${eventType})---(method:${methodToCall})`)
  console.log(`>>Before       ${methodToCall}`, activeBeforeMethods)
  console.log(`>>Namespaced:  ${methodToCall}`, allNameSpacedCalls)
  console.log(`>>Core         ${methodToCall}`, coreMethodsToCall)
  console.log(`>>──────────────────────────────────────────────────(type:${eventType})<<`)
  /**/

  /**
   * Run final reducer over the core methods to call
   *
   * 1. Runs method['name'] with plugin scoped payload
   * 2a. If method returns abort call, stop the flow
   * 2b. If no abort, continue over all
   */
  const actionFinal = coreMethodsToCall.reduce((newAction, plugin, i) => {
    const { NAMESPACE } = plugin
    const pluginSpecificPayload = eventPayloads[NAMESPACE]
    const lastCall = coreMethodsToCall.length === (i + 1)

    if (shouldAbort(newAction, NAMESPACE)) {
      if (shouldAbortAll(newAction, allPluginKeys.length)) {
        console.log('Everything aborted', AbortAction(methodToCall, NAMESPACE))
        // @TODO figure out if you want to emit all the abort events
        // return newAction
      }
      if (shouldDispatch) {
        store.dispatch({
          type: AbortAction(methodToCall, NAMESPACE),
          abort: newAction.abort,
        })
      }

      aborted = addToArray(aborted, NAMESPACE)

      if (shouldDispatch && lastCall) { // && !eventType.match(/End$/)
        const endDispatch = {
          type: EndAction(methodToCall),
          aborted: aborted,
          completed: completed,
          ...cleanAction(newAction),
        }
        store.dispatch(endDispatch)
        // Duplicated run CB logic. Extract into function.
        const cb = getCallback(newAction)
        if (cb) {
          /** @TODO figure out exact args calls and .on will get */
          const cbArgs = makeArgs(endDispatch, plugin)
          const finalCBArgs = Object.assign({}, cbArgs)
          delete finalCBArgs.abort
          cb(finalCBArgs)
        }
      }
      return newAction
    }

    let cleanedAction = cleanAction(pluginSpecificPayload)
    let pluginReturnValue = {}
    let actionQueued = false
    if (plugin[methodToCall] && typeof plugin[methodToCall] === 'function') {
      /* check for namespaced called of same plugin name.
      Example "ready:plugin-one" is not allowed in "plugin-one" */
      validateMethod(methodToCall, NAMESPACE)

      const state = instance.getState()
      const pluginsFromState = state.plugins
      const isLoaded = isPluginLoaded(pluginsFromState[NAMESPACE], eventType)
      const isOffline = state.context.offline

      /* Call plugin method */
      let returnValue

      /* @TODO handle offline queuing */
      if (isOffline) {
        console.log('Offline queue action')
      }

      if (!isLoaded) {
        console.log(`Plugin "${NAMESPACE}" not loaded yet. Queue action ${methodToCall}`)

        const queueItem = {
          ...cleanedAction,
          type: eventType,
          meta: {
            ...cleanedAction.meta,
            queued: true,
            plugins: [ NAMESPACE ]
          },
        }

        // theQueue.enqueue(queueItem)

        /* @TODO handle queuing */
        if (shouldDispatch) { // && action.meta.queue === true?
          const p = {
            type: 'queue',
            plugin: NAMESPACE,
            method: methodToCall,
            action: queueItem
          }
          // dispatch queue
          store.dispatch(p)

          queued = addToArray(queued, NAMESPACE)

          // Set side effect wait for ready
          const checkForLoaded = () => {
            const p = instance.getState('plugins')
            return p[NAMESPACE].loaded
          }
          waitForReady(plugin, checkForLoaded, 10000).then((d) => {
            console.log(`Loaded ${methodToCall}`, NAMESPACE)
            const data = {
              aborted: aborted,
              completed: completed,
              total: coreMethodsToCall
            }
            // Causing double dispatches...
            // doLogic(p, plugins, instance, store, data)
          }).catch((e) => {
            console.log(`Error loading ${NAMESPACE} for ${methodToCall} call`, e)
            // TODO dispatch failure
          })
        }

        // actionQueued = true

        // Set queued true and avoid dispatching below
        // returnValue = {
        //   ...cleanedAction,
        //   queued: true
        // }
      }

      if (isLoaded) {
        const payload = {
          ...cleanedAction,
          type: eventType, // WAS methodToCall... verify this doesnt break others
        }
        const functionArgs = makeArgs(payload, plugin)
        returnValue = plugin[methodToCall](functionArgs)

        completed = addToArray(completed, NAMESPACE)
      }

      if (returnValue && typeof returnValue === 'object') {
        pluginReturnValue = Object.assign({}, returnValue, { type: eventType })
        validateReturnValue(eventType, pluginReturnValue.type, methodToCall, NAMESPACE)
      }
    }

    console.log('pluginReturnValue.queued', NAMESPACE, actionQueued)

    /**********************************************
     * Dispatch Namespaced event
     * ex: 'page:google-tag-manager'
     **********************************************/

    const nameSpacedEvent = `${methodToCall}:${NAMESPACE}`
    const actionDepth = (nameSpacedEvent.match(/:/g) || []).length
    if (shouldDispatch && actionDepth < 3 && !queued.includes(NAMESPACE)) {
      /* const scopedCalls = allNameSpacedCalls[plugin.NAMESPACE] || []
      const functionsCalled = scopedCalls.map((invidualMethod) => {
        return `${invidualMethod.NAMESPACE}.${invidualMethod.event}`
      })
      console.log('functionsCalled', functionsCalled)
      /**/

      store.dispatch({
        // ...pluginReturnValue,
        type: nameSpacedEvent,
        ...cleanedAction,
        meta: {
          ...cleanedAction.meta,
          called: (actionDepth === 1) ? true : null,
        },
      })
    }

    if (shouldAbortAll(pluginReturnValue, allPluginKeys.length)) {
      // if (shouldDispatch) {
      store.dispatch({
        type: AbortAllAction(methodToCall),
        abort: pluginReturnValue.abort,
      })
      // }
    }

    // Only emit end events on 'name' and 'name:plugin' events
    const maxEmit = 2 // (minus 1)
    if (shouldDispatch && lastCall && actionDepth < maxEmit) { // && !eventType.match(/End$/)
      // IF types are the same the action has already dispatched
      const obj = Object.assign({}, cleanedAction, pluginReturnValue)
      console.log('merged Obj', obj)
      /**
       * 🔥🔥
       * Todo fix the object that passes into the core method calls
       * It is picking up the 'page:segment' payload and thats not right
       *
       * 'obj' is wrong
       *
       * newAction is the right payload.
       *
       * Test it when pageStart and page alter it
       */
      console.log('original obj', newAction)
      if (methodToCall !== eventType) {
        /**********************************************
         * Dispatch Core event
         * ex: 'page'
         **********************************************/
        store.dispatch({
          ...newAction,
          type: methodToCall,
          meta: {
            ...newAction.meta,
            called: true
          },
        })
      }
      /**********************************************
       * Dispatch Core event End
       * ex: 'pageEnd'
       **********************************************/
      // if (!actionQueued) { // prevents double dispatch
        const endDispatch = {
          ...newAction,
          type: EndAction(methodToCall),
          meta: {
            ...newAction.meta,
            aborted: aborted, // TODO fix this array
            completed: completed,
            queued: queued
          },
        }
        store.dispatch(endDispatch)
        /* Fire callbacks if found. analytics.track('thing', callbackFunc) */
        const cb = getCallback(newAction)
        if (cb) {
          /** @TODO figure out exact args calls and .on will get */
          const cbArgs = makeArgs(endDispatch, plugin)
          const finalCBArgs = Object.assign({}, cbArgs)
          delete finalCBArgs.abort
          cb(finalCBArgs)
        }
      // }
    }
    // console.log('pluginReturnValue', pluginReturnValue)
    return Object.assign({}, newAction, pluginReturnValue)
  }, nameSpacedAction)
  // console.log('Action value: actionFinal', actionFinal)

  /**
   * Fallthrough case
   * If no plugin methods are found, we need to trigger the additional actions
   */
  const CORE_EVENT = systemEvents.includes(eventType)
  if (CORE_EVENT && !coreMethodsToCall.length && shouldDispatch) {
    const isEnd = methodToCall.match(/End$/)
    // alert(`no methods for ${methodToCall} found`)
    if (!methodToCall.match(/:/) || !isEnd) {
      // console.log('methodToCall', methodToCall)
      store.dispatch({
        ...actionFinal,
        type: methodToCall,
        meta: {
          ...actionFinal.meta,
          called: true
        },
      })
    }

    if (!isEnd) {
      const endDispatch = {
        ...actionFinal,
        type: EndAction(methodToCall),
        meta: {
          ...actionFinal.meta,
          called: true
        },
        completed: completed,
      }
      store.dispatch(endDispatch)

      /* Run callback */
      const cb = getCallback(actionFinal)
      if (cb) {
        cb({ instance, payload: endDispatch }) // eslint-disable-line
      }
    }
  }
  return actionFinal
}

function isPluginLoaded(plugin, type) {
  // Always run the initialize and bootstrap methods
  if (type.match(/^initialize/) || type.match(/^bootstrap/)) {
    return true
  }
  return plugin && plugin.loaded
}

function notAbortableError(action, method) {
  return () => {
    throw new Error(`This action ${action.type} is not abortable. Remove abort call from ${method}`)
  }
}

/**
 * Generate arguments to pass to plugin methods
 * @param  {Object} instance - analytics instance
 * @param  {[type]} allPlugins [description]
 * @return {[type]}            [description]
 */
function argumentFactory(instance, allPlugins) {
  return function (action, plugin, otherPlugin) {
    const { config, NAMESPACE } = plugin
    let method = `${NAMESPACE}.${action.type}`
    if (otherPlugin) {
      method = otherPlugin.event
    }

    const abortF = (action.type.match(/Start$/))
      ? abortFunction(NAMESPACE, method, allPlugins, otherPlugin, action)
      : notAbortableError(action, method)

    return {
      /* self: plugin, for future maybe */
      // clone objects to avoid reassign
      payload: formatPayload(action),
      instance: instance,
      config: config || {},
      abort: abortF
    }
  }
}

export function formatPayload(action) {
  return Object.keys(action).reduce((acc, key) => {
    // redact type from { payload }
    if (key === 'type') {
      return acc
    }
    if (typeof action[key] === 'object') {
      acc[key] = Object.assign({}, action[key])
    } else {
      acc[key] = action[key]
    }
    return acc
  }, {})
}

function shouldAbort({ abort }, pluginName) {
  if (!abort) return false
  if (abort === true) return true
  return includes(abort, pluginName) || (abort && includes(abort.plugins, pluginName))
}

function shouldAbortAll({ abort }, pluginsCount) {
  if (!abort) return false
  if (abort === true || typeof abort === 'string') return true
  const { plugins } = abort
  return isArray(abort) && (abort.length === pluginsCount) || isArray(plugins) && (plugins.length === pluginsCount)
}

function isArray(arr) {
  return Array.isArray(arr)
}

function includes(arr, name) {
  if (!arr || !isArray(arr)) return false
  return arr.includes(name)
}

// TODO refactor signature
function abortFunction(pluginName, method, abortablePlugins, otherPlugin, action) {
  return function (reason, plugins) {
    const caller = (otherPlugin) ? otherPlugin.NAMESPACE : pluginName
    let pluginsToAbort = (plugins && Array.isArray(plugins)) ? plugins : abortablePlugins
    if (otherPlugin) {
      pluginsToAbort = (plugins && Array.isArray(plugins)) ? plugins : [pluginName]
      if (!pluginsToAbort.includes(pluginName) || pluginsToAbort.length !== 1) {
        throw new Error(`Method "${method}" can only abort "${pluginName}" plugin. ${JSON.stringify(pluginsToAbort)} input valid`)
      }
    }
    return {
      ...action, // 🔥 todo verify this merge is ok
      abort: {
        reason: reason,
        plugins: pluginsToAbort,
        caller: method,
        // _: caller
      }
    }
  }
}

function getCallback(action) {
  if (!action.meta) {
    return false
  }
  return Object.keys(action.meta).reduce((acc, key) => {
    const thing = action.meta[key]
    if (typeof thing === 'function') {
      return thing
    }
    return acc
  }, false)
}

function addToArray(arr, name) {
  if (!arr.includes(name)) {
    return arr.concat(name)
  }
  return arr
}

// TODO cleanup this
function cleanAction(action) {
  const newAction = Object.assign({}, action)
  delete newAction.type
  delete newAction.abort
  return newAction
}

function validateReturnValue(originalActionType, updatedActionType, functionName, pluginName) {
  if (originalActionType !== updatedActionType) {
    throw new Error([`Plugins should not alter the 'type' property.`,
      `${pluginName}[${functionName}] is altering changing type from '${originalActionType}' to '${updatedActionType}'`,
    ].join('\n')
    )
  }
}

function validateMethod(actionName, name) {
  const text = getNameSpacedAction(actionName)
  const methodCallMatchesPluginNamespace = text && (text.name === name)
  if (methodCallMatchesPluginNamespace) {
    const sub = getNameSpacedAction(text.method)
    const subText = (sub) ? `or "${sub.method}"` : ''
    throw new Error([`Plugin "${name}" is calling method [${actionName}]`,
      `Plugins should not call their own namespace.`,
      `Use "${text.method}" ${subText} in "${name}" plugin instead of "${actionName}"`]
      .join('\n')
    )
  }
}

function getNameSpacedAction(type) {
  const split = type.match(/(.*):(.*)/)
  if (!split) {
    return false
  }
  return {
    name: split[2],
    method: split[1]
  }
}
