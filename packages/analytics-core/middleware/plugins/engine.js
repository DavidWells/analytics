import getPluginByMethod from '../../utils/getPluginByMethod'
import filterDisabled from '../../utils/filterDisabled'
import EVENTS from '../../events'

export default function runSimpleHooks(action, instance, plugins, store, systemEvents) {
  const { type, meta } = action

  if (type === EVENTS.enablePlugin || type === EVENTS.disablePlugin) {
    // @TODO reset function cache
    // cache = {}
  }
  /* If action already dispatched exit early */
  if (meta && meta.called) {
    // This makes it so plugin methods dont get fired twice.
    return action
  }

  /* certain plugins shouldnt dispatch again to avoid infinite  */
  let shouldDispatch = type.match(/Start$/)

  let shouldExecute = (type.match(/^ready/)) ? false : true // eslint-disable-line
  shouldExecute = true // @TODO this seems to be working fine. might not need conditional

  let beforeMethods = []
  let coreName = type
  let completed = []
  let aborted = []

  if (type.match(/Start$/)) {
    beforeMethods = getPluginByMethod(type, plugins)
    coreName = type.replace(/Start$/, '')
  }

  /*  */
  let allPluginMethodCalls = getPluginByMethod(coreName, plugins)

  /* We must register all plugins */
  if (coreName === 'registerPlugin') {
    allPluginMethodCalls = Object.keys(plugins).map((name) => {
      return plugins[name]
    })
  }

  const allKeys = allPluginMethodCalls.map((plugin) => plugin.NAMESPACE)
  /* make args for functions to concume */
  const makeArgs = generateArgs(instance, allKeys)
  /* Grab current state to check if plugins are enabled */
  const state = instance.getState()
  /* Filter out currently disabled plugins */
  const activeBeforeMethods = filterDisabled(beforeMethods, state.plugins, action.options)

  /* All ‘blankStart’ calls get processed */
  const actionBefore = activeBeforeMethods.reduce((newAction, plugin) => {
    // Call methods. Only called 'actionStart'
    let pluginReturnValue = newAction
    if (plugin[type] && typeof plugin[type] === 'function') {
      const funcArgs = makeArgs(newAction, plugin)
      /* Call the plugin function */
      const returnValue = plugin[type](funcArgs)

      if (returnValue && typeof returnValue === 'object') {
        pluginReturnValue = Object.assign({}, returnValue, { type: newAction.type })
        validateReturnValue(newAction.type, pluginReturnValue.type, type, plugin.NAMESPACE)
      }

      // if (pluginReturnValue.abort && pluginReturnValue.abort.includes(plugin.NAMESPACE)) {
      //   store.dispatch({
      //     ...pluginReturnValue,
      //     type: `${type}Aborted:${plugin.NAMESPACE}`,
      //   })
      // }

      // if (shouldDispatch) {
      store.dispatch({
        ...pluginReturnValue,
        type: `${type}:${plugin.NAMESPACE}`,
        meta: {
          ...pluginReturnValue.meta,
          called: true
        },
      })
      // }
    }
    return Object.assign({}, newAction, pluginReturnValue)
  }, action)
  // console.log('Action value: actionBefore', actionBefore)

  /* newActionValue contains abort. Stop everything else */
  if (shouldDispatch && actionBefore.abort && actionBefore.abort.length === allKeys.length) {
    store.dispatch({
      type: `${coreName}Aborted`,
      plugins: actionBefore.abort,
      reason: actionBefore.reason,
    })
    return actionBefore
  }

  // 🔥 @TODO do we want to emit an aborted event if { plugins: { vanilla: false }}
  let activeMethods = filterDisabled(allPluginMethodCalls, state.plugins, action.options)
  // console.log(`activeMethods type:${type} | core:${coreName}`, activeMethods)

  const allNameSpacedCalls = activeMethods.reduce((acc, kind) => {
    const nsAction = `${coreName}:${kind.NAMESPACE}`
    // different for whateverStart
    const nsActionOther = `${type}:${kind.NAMESPACE}`

    const nsActionType = nsAction.match(/:/g) || []
    // console.log('nsActionA', nsAction)
    // console.log('nsActionB', nsActionOther)
    // console.log('nsAction#', nsActionType.length)
    // console.log('nsAction=', nsAction === nsActionOther)
    /* Ignore 'action:plugin:plugin' calls */
    if (nsActionType.length > 1) {
      // console.log(`${nsAction} ignored`)
      return acc
    }
    /* Look for hookStart:xyz & hook:xyz */
    let beforeFuncs = []
    if (nsAction !== nsActionOther) {
      /* get matching plugin[action + Before] functions */
      beforeFuncs = getPluginByMethod(nsActionOther, plugins).map((p) => {
        return {
          event: nsActionOther,
          NAMESPACE: p.NAMESPACE,
          func: p[nsActionOther]
        }
      })
    }
    /* get matching plugin[action] functions */
    const foundFuncs = getPluginByMethod(nsAction, plugins).map((p) => {
      return {
        event: nsAction,
        NAMESPACE: p.NAMESPACE,
        func: p[nsAction]
      }
    })
    /* combine before funcs & namespaced functions */
    const combinedFunctionsToRun = beforeFuncs.concat(foundFuncs)
    if (combinedFunctionsToRun.length) {
      acc[kind.NAMESPACE] = combinedFunctionsToRun
    }
    return acc
  }, {})

  /* Payloads are cached and passed through the chain for plugin specific calls */
  let payloads = {}
  let actionNameSpaced = actionBefore
  // 🔥 🔥 🔥 DOUBLE CHECK should execute against other plugin methods
  if (shouldExecute) {
    /* Loop over active plugins & call all matching plugin methods */
    actionNameSpaced = activeMethods.reduce((newAction, plugin) => {
      // alert(`${typeof theAction.abort}`)
      if (shouldAbort(newAction, plugin.NAMESPACE)) {
        if (shouldDispatch) {
          store.dispatch({
            type: `${coreName}Aborted:${plugin.NAMESPACE}`,
            plugins: newAction.abort,
            reason: newAction.reason,
            abortData: newAction.abortData,
            here: 'sup'
          })
        }

        // @TODO Append to aborted array here
        aborted = addToArray(aborted, plugin.NAMESPACE)
        return newAction
      }

      /* Loop over ‘method:{PluginName}’ functions and derive new action value */
      const methods = allNameSpacedCalls[plugin.NAMESPACE]
      if (methods) {
        const nameSpacedAction = methods.reduce((accum, nsPlugin) => {
          /* If abort and abort matches the plugin name. exit early */
          if (accum.abort && accum.abort.includes(plugin.NAMESPACE)) {
            // store.dispatch({
            //   type: `${coreName}Aborted:${plugin.NAMESPACE}`,
            //   plugins: accum.abort,
            //   reason: accum.reason,
            //   abortData: accum.abortData,
            //   xxxxorHere: 'xxxxxx'
            // })
            // if (state.context.debug) {
            //   console.log(`"${nsPlugin.event}" method not called in ${nsPlugin.pluginName} plugin.`)
            //   console.log(`Reason: abort("${accum.reason}") from "${accum.caller}" plugin`)
            // }
            return accum
          }

          let pluginReturnValue = {}
          if (nsPlugin.func && typeof nsPlugin.func === 'function') {
            /* check for namespaced called of same plugin name */
            validateMethod(nsPlugin.event, nsPlugin.NAMESPACE)

            /* Call plugin method */
            const returnValue = nsPlugin.func(
              makeArgs({
                ...accum,
                // from: 'namespacedAction',
              }, plugin, nsPlugin) // <== needs nsPlugin for correct abort traces
            )

            if (returnValue && typeof returnValue === 'object') {
              pluginReturnValue = Object.assign({}, returnValue, { type: accum.type })
              validateReturnValue(accum.type, pluginReturnValue.type, nsPlugin.event, nsPlugin.NAMESPACE)
              // pluginReturnValue = returnValue
            }
          }

          if (pluginReturnValue.abort && pluginReturnValue.abort.includes(plugin.NAMESPACE)) { // @todo check array for name? maybe not bc u can only abort your namespace
            if (shouldDispatch) {
              store.dispatch({
                type: `${coreName}Aborted:${plugin.NAMESPACE}`,
                plugins: pluginReturnValue.abort,
                reason: pluginReturnValue.reason,
                abortData: pluginReturnValue.abortData,
              })
            }
            // @TODO Append to aborted array here
            aborted = addToArray(aborted, plugin.NAMESPACE)
            /* Aborted return early. Seems to be working */
            return pluginReturnValue
          }
          const combine = Object.assign({}, accum, pluginReturnValue)
          // console.log(`ABORTED= ${type} ${plugin.NAMESPACE}`, combine)
          return combine
        }, newAction)

        /* `name:method` Abort() was called. Exit early */
        if (nameSpacedAction.abort && nameSpacedAction.abort.includes(plugin.NAMESPACE)) {
          // console.log('nameSpacedAction.abort', nameSpacedAction.abort)
          // alert(`abort ${plugin.NAMESPACE}.${coreName} now`)
          return Object.assign({}, newAction, nameSpacedAction)
        }

        if (nameSpacedAction && typeof nameSpacedAction === 'object') {
          /* Save plugin specific action payload. (If plugins have altered a specific call) */
          payloads[plugin.NAMESPACE] = Object.assign({}, nameSpacedAction)
          // Return original action so we don't modify all calls
          return newAction // <--- Object.assign({}, theAction, nameSpacedAction)
        }
      }

      /* Save payload for specific calls */
      payloads[plugin.NAMESPACE] = Object.assign({}, newAction)

      return newAction
    }, actionBefore)
  }
  // console.log('Action value: actionNameSpaced', actionNameSpaced)

  /**
   * Filter over the plugin method calls and remove aborted plugin by name
   */
  const coreMethodsToCall = activeMethods.filter((plugin) => {
    if (shouldAbort(actionNameSpaced, plugin.NAMESPACE)) {
      aborted = addToArray(aborted, plugin.NAMESPACE)
      return false
    }
    return true
  })

  /*
  if (DEBUG) {
    console.log(`>>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━(type:${type})<<`)
    console.log(`>>(type:${type})---(coreName:${coreName})`)
    console.log(`>>Before       ${coreName}`, activeBeforeMethods)
    console.log(`>>Namespaced:  ${coreName}`, allNameSpacedCalls)
    console.log(`>>Core         ${coreName}`, coreMethodsToCall)
    console.log(`>>──────────────────────────────────────────────────(type:${type})<<`)
  }
  /**/

  /**
   * Run final reducer over the core methods to call
   *
   * 1. Runs method['name'] with scoped payload
   * 2a. If method returns abort call, stop the flow
   * 2b. If no abort, continue over all
   */
  const actionFinal = coreMethodsToCall.reduce((newAction, plugin, i) => {
    /* actionForSpecificPlugin pulled from previous reducer */
    const { NAMESPACE } = plugin
    const actionForSpecificPlugin = payloads[NAMESPACE]
    const lastCall = coreMethodsToCall.length === (i + 1)

    if (shouldAbort(newAction, NAMESPACE)) {
      if (newAction.abort && newAction.abort.length === allKeys.length) {
        console.log('Everything aborted', `${coreName}Aborted:${NAMESPACE}`)
        // @TODO figure out if you want to emit all the abort events
        // return newAction
      }
      if (shouldDispatch) {
        store.dispatch({
          type: `${coreName}Aborted:${NAMESPACE}`,
          plugins: newAction.abort,
          reason: newAction.reason,
          abortData: newAction.abortData,
        })
      }

      // @TODO Append to aborted array here
      // aborted = aborted.concat(plugin.NAMESPACE)
      aborted = addToArray(aborted, NAMESPACE)

      if (shouldDispatch && lastCall) { // && !type.match(/End$/)
        const endDispatch = {
          type: `${coreName}End`,
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

    let cleanedAction = cleanAction(actionForSpecificPlugin)
    let pluginReturnValue = {}

    if (plugin[coreName] && typeof plugin[coreName] === 'function') {
      /* check for namespaced called of same plugin name. Example "ready:plugin-one" is not allowed in "plugin-one" */
      validateMethod(coreName, NAMESPACE)

      const state = instance.getState()
      const pluginsFromState = state.plugins
      const isLoaded = isPluginLoaded(pluginsFromState[NAMESPACE], type)
      const isOffline = state.context.offline

      /* @TODO handle offline queuing */
      if (isOffline) {
        // store.dispatch({
        //   type: 'queue-offline',
        //   originalType: type,
        //   plugin: plugin.NAMESPACE,
        //   action: cleanedAction
        // })
      }
      /* Call plugin method */
      let returnValue

      if (isLoaded) {
        returnValue = plugin[coreName](
          makeArgs({
            ...cleanedAction,
            type: type, // WAS coreName... verify this doesnt break others
          }, plugin)
        )
      } else {
        /* @TODO handle queuing */
        if (shouldDispatch) { // && action.meta.queue === true?
          // add action to a queue.
          // Do I need to check for what needs to get queued?
          // How to handle partial failures? (like GA failing but segment working)
        }
      }

      if (returnValue && typeof returnValue === 'object') {
        pluginReturnValue = Object.assign({}, returnValue, { type: type })
        validateReturnValue(type, pluginReturnValue.type, coreName, NAMESPACE)
        // pluginReturnValue = returnValue
      }
    }

    completed = addToArray(completed, NAMESPACE)

    const nameSpacedEvent = `${coreName}:${NAMESPACE}`
    const count = nameSpacedEvent.match(/:/g) || []
    // console.log(`count ${nameSpacedEvent}`, count.length)
    if (shouldDispatch && count.length < 3) {
      /* const x = allNameSpacedCalls[plugin.NAMESPACE] || []
      const y = x.map((thing) => {
        return `${thing.NAMESPACE}.${thing.event}`
      })
      /**/

      // NEED to attach something to this event to stop functions from running again next time
      store.dispatch({
        // ...pluginReturnValue,
        type: nameSpacedEvent,
        ...cleanedAction,
        meta: {
          ...cleanedAction.meta,
          called: (count.length === 1) ? true : null,
        },
      })
    }

    if (pluginReturnValue.abort && pluginReturnValue.abort.length === allKeys.length) {
      // if (shouldDispatch) {
      store.dispatch({
        type: `${coreName}Aborted`,
        plugins: pluginReturnValue.abort,
        reason: pluginReturnValue.reason,
        abortData: pluginReturnValue.abortData,
      })
      // }
    }

    // Only emit end events on 'name' and 'name:plugin' events
    const maxEmit = 2 // (minus 1)
    if (shouldDispatch && lastCall && count.length < maxEmit) { // && !type.match(/End$/)
      // IF types are the same the action has already dispatched
      const obj = Object.assign({}, cleanedAction, pluginReturnValue)
      if (coreName !== type && !pluginReturnValue.abort) {
        store.dispatch({
          ...obj,
          type: `${coreName}`,
          meta: {
            ...obj.meta,
            called: true
          },
        })
      }
      const endDispatch = {
        ...obj,
        type: `${coreName}End`,
        meta: {
          ...obj.meta,
          aborted: aborted, // TODO fix this array
          completed: completed,
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
    }
    // console.log('pluginReturnValue', pluginReturnValue)
    return Object.assign({}, newAction, pluginReturnValue)
    // return newAction
  }, actionNameSpaced)
  // console.log('Action value: actionFinal', actionFinal)

  /**
   * Fallthrough case
   * If no plugin methods are found, we need to trigger the additional actions
   */
  const CORE_EVENT = systemEvents.includes(type)
  if (CORE_EVENT && !coreMethodsToCall.length && shouldDispatch) {
    // alert(`no methods for ${coreName} found`)
    if (!coreName.match(/:/) || !coreName.match(/End$/)) {
      // console.log('coreName', coreName)
      store.dispatch({
        ...actionFinal,
        type: coreName,
        meta: {
          ...actionFinal.meta,
          called: true
        },
      })
    }

    if (!coreName.match(/End$/)) {
      store.dispatch({
        ...actionFinal,
        type: `${coreName}End`,
        meta: {
          ...actionFinal.meta,
          called: true
        },
        completed: completed,
      })
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
function generateArgs(instance, allPlugins) {
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
      abort: pluginsToAbort,
      reason: reason,
      abortData: {
        plugin: caller,
        method: method,
        reason: reason
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
  delete newAction.reason
  delete newAction.abortData
  return newAction
}

function shouldAbort(action, name) {
  return action && action.abort && Array.isArray(action.abort) && action.abort.includes(name)
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
