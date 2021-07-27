import EVENTS from '../../events'
import fitlerDisabledPlugins from '../../utils/filterDisabled'
import { isFunction, isObject, isString } from '@analytics/type-utils'
import { runCallback } from '../../utils/callback-stack'

const endsWithStartRegex = /Start$/
const bootstrapRegex = /^bootstrap/
const readyRegex = /^ready/

export default async function (action, getPlugins, instance, store, eventsInfo) {
  const pluginObject = isFunction(getPlugins) ? getPlugins() : getPlugins
  const originalType = action.type
  const updatedType = originalType.replace(endsWithStartRegex, '')

  /* If action already dispatched exit early. This makes it so plugin methods are not fired twice. */
  if (action._ && action._.called) {
    // console.log('Already called', action._.called)
    return action
  }

  const state = instance.getState()
  /* Remove plugins that are disabled by options or by settings */
  let activePlugins = fitlerDisabledPlugins(pluginObject, state.plugins, action.options)

  /* If analytics.plugin.enable calls do special behavior */
  if (originalType === EVENTS.initializeStart && action.fromEnable) {
    // Return list of all enabled plugins that have NOT been initialized yet
    activePlugins = Object.keys(state.plugins).filter((name) => {
      const info = state.plugins[name]
      return action.plugins.includes(name) && !info.initialized
    }).map((name) => pluginObject[name])
  }
  // console.log(`engine activePlugins ${action.type}`, activePlugins)

  const allActivePluginKeys = activePlugins.map((p) => p.name)
  // console.log('allActivePluginKeys', allActivePluginKeys)
  const allMatches = getAllMatchingCalls(originalType, activePlugins, pluginObject)
  // console.log('allMatches', allMatches)

  /* @TODO cache matches and purge on enable/disable/add plugin */

  /**
   * Process all 'actionBefore' hooks
   * Example:
   *  This is processes 'pageStart' methods from plugins and update the event to send through the chain
   */
  const actionBefore = await processEvent({
    action: action,
    data: {
      exact: allMatches.before,
      namespaced: allMatches.beforeNS
    },
    state: state,
    allPlugins: pluginObject,
    allMatches,
    instance,
    store,
    EVENTS: eventsInfo
  })
  // console.log('____ actionBefore out', actionBefore)

  /* Abort if ‘eventBefore’ returns abort data */
  if (shouldAbortAll(actionBefore, allActivePluginKeys.length)) {
    return actionBefore
  }

  /* Filter over the plugin method calls and remove aborted plugin by name */
  // const activeAndNonAbortedCalls = activePlugins.filter((plugin) => {
  //   if (shouldAbort(actionBefore, plugin.name)) return false
  //   return true
  // })
  // console.log(`activeAndNonAbortedCalls ${action.type}`, activeAndNonAbortedCalls)

  let actionDuring
  if (originalType === updatedType) {
    /* If type the same don't double process */
    actionDuring = actionBefore
  } else {
    /**
     * Process all 'action' hooks
     * Example: This is process 'page' methods from plugins and update the event to send through
     */
    actionDuring = await processEvent({
      action: {
        ...actionBefore,
        type: updatedType
      },
      data: {
        exact: allMatches.during,
        namespaced: allMatches.duringNS
      },
      state: state,
      allPlugins: pluginObject,
      allMatches,
      instance,
      store,
      EVENTS: eventsInfo
    })
  }
  // console.log('____ actionDuring', actionDuring)

  /**
   * Process all 'actionEnd' hooks
   * Example:
   *  This is process 'pageEnd' methods from plugins and update the event to send through
   */
  // Only trigger `eventTypeEnd` if originalAction has Start ending.
  if (originalType.match(endsWithStartRegex)) {
    const afterName = `${updatedType}End`
    const actionAfter = await processEvent({
      action: {
        ...actionDuring,
        type: afterName
      },
      data: {
        exact: allMatches.after,
        namespaced: allMatches.afterNS
      },
      state: state,
      allPlugins: pluginObject,
      allMatches,
      instance,
      store,
      EVENTS: eventsInfo
    })
    // console.log('____ actionAfter', actionAfter)

    /* Fire callback if supplied */
    if (actionAfter.meta && actionAfter.meta.hasCallback) {
      /*
      console.log('End of engine action has callback')
      console.log(actionAfter.meta)
      console.log('stack', stack)
      /** */

      // @TODO figure out exact args calls and .on will get
      runCallback(actionAfter.meta.rid, { payload: actionAfter })
    }
  }

  return actionBefore
}

/**
 * Async reduce over matched plugin methods
 * Fires plugin functions
 */
async function processEvent({
  data,
  action,
  instance,
  state,
  allPlugins,
  allMatches,
  store,
  EVENTS
}) {
  const { plugins, context } = state
  const method = action.type
  const isStartEvent = method.match(endsWithStartRegex)
  // console.log(`data ${method}`, data)
  // console.log(`data allMatches ${method}`, allMatches)
  let abortable = data.exact.map((x) => {
    return x.pluginName
  })

  /* If abort is called from xyzStart */
  if (isStartEvent) {
    abortable = allMatches.during.map((x) => {
      return x.pluginName
    })
  }

  /* make args for functions to concume */
  const makeArgs = argumentFactory(instance, abortable)
  // console.log('makeArgs', makeArgs)

  /* Check if plugin loaded, if not mark action for queue */
  const queueData = data.exact.reduce((acc, thing) => {
    const { pluginName, methodName } = thing
    let addToQueue = false
    // Queue actions if plugin not loaded except for initialize and reset
    if (!methodName.match(/^initialize/) && !methodName.match(/^reset/)) {
      addToQueue = !plugins[pluginName].loaded
    }
    /* If offline and its a core method. Add to queue */
    if (context.offline && (methodName.match(/^(page|track|identify)/))) {
      addToQueue = true
    }
    acc[`${pluginName}`] = addToQueue
    return acc
  }, {})

  /* generate plugin specific payloads */
  const payloads = await data.exact.reduce(async (scoped, curr, i) => {
    const { pluginName } = curr
    const curScope = await scoped
    if (data.namespaced && data.namespaced[pluginName]) {
      const scopedPayload = await data.namespaced[pluginName].reduce(async (acc, p, count) => {
        // await value
        const curScopeData = await acc
        if (!p.method || !isFunction(p.method)) {
          return curScopeData
        }

        /* Make sure plugins don’t call themselves */
        validateMethod(p.methodName, p.pluginName)

        function genAbort(currentAct, pname, otherPlug) {
          return function (reason, plugins) {
            const callsite = otherPlug || pname
            // console.log(`__abort msg: ${reason}`)
            // console.log(`__abort ${pname}`)
            // console.log(`__abort xxx: ${plugins}`)
            // console.log(`__abort otherPlug`, otherPlug)
            return {
              ...currentAct,
              abort: {
                reason: reason,
                plugins: plugins || [pname],
                caller: method,
                from: callsite
              }
            }
          }
        }

        const val = await p.method({
          payload: curScopeData,
          instance,
          abort: genAbort(curScopeData, pluginName, p.pluginName),
          config: getConfig(p.pluginName, plugins, allPlugins),
          plugins: plugins
        })
        const returnValue = isObject(val) ? val : {}
        return Promise.resolve({
          ...curScopeData,
          ...returnValue
        })
      }, Promise.resolve(action))

      /* Set scoped payload */
      curScope[pluginName] = scopedPayload
    } else {
      /* Set payload as default action */
      curScope[pluginName] = action
    }
    return Promise.resolve(curScope)
  }, Promise.resolve({}))
  // console.log(`aaa scoped payloads ${action.type}`, payloads)

  // Then call the normal methods with scoped payload
  const resolvedAction = await data.exact.reduce(async (promise, curr, i) => {
    const lastLoop = data.exact.length === (i + 1)
    const { pluginName } = curr
    const currentPlugin = allPlugins[pluginName]
    const currentActionValue = await promise

    let payloadValue = (payloads[pluginName]) ? payloads[pluginName] : {}
    /* If eventStart, allow for value merging */
    if (isStartEvent) {
      payloadValue = currentActionValue
    }

    if (shouldAbort(payloadValue, pluginName)) {
      // console.log(`> Abort from payload specific "${pluginName}" abort value`, payloadValue)
      abortDispatch({
        data: payloadValue,
        method,
        instance,
        pluginName,
        store
      })
      return Promise.resolve(currentActionValue)
    }
    if (shouldAbort(currentActionValue, pluginName)) {
      // console.log(`> Abort from ${method} abort value`, currentActionValue)
      if (lastLoop) {
        abortDispatch({
          data: currentActionValue,
          method,
          instance,
          // pluginName,
          store
        })
      }
      return Promise.resolve(currentActionValue)
    }

    if (queueData.hasOwnProperty(pluginName) && queueData[pluginName] === true) {
      // console.log('Queue this instead', pluginName)
      store.dispatch({
        type: `queue`,
        plugin: pluginName,
        payload: payloadValue,
        /* Internal data for analytics engine */
        _: {
          called: `queue`,
          from: 'queueMechanism' // for debugging
        }
      })
      return Promise.resolve(currentActionValue)
    }
    /*
    const checkForLoaded = () => {
      const p = instance.getState('plugins')
      return p[currentPlugin.name].loaded
    }
    // const p = instance.getState('plugins')
    console.log(`loaded "${currentPlugin.name}" > ${method}:`, p[currentPlugin.name].loaded)
    // await waitForReady(currentPlugin, checkForLoaded, 10000).then((d) => {
    //   console.log(`Loaded ${method}`, currentPlugin.name)
    // }).catch((e) => {
    //   console.log(`Error ${method} ${currentPlugin.name}`, e)
    //   // TODO dispatch failure
    // })
    */

    // @TODO figure out if we want queuing semantics

    const funcArgs = makeArgs(payloads[pluginName], allPlugins[pluginName])

    // console.log(`funcArgs ${method} ${pluginName}`, funcArgs)

    /* Run the plugin function */
    const val = await currentPlugin[method]({
      // currentPlugin: pluginName,
      abort: funcArgs.abort,
      // Send in original action value or scope payload
      payload: payloadValue,
      instance,
      config: getConfig(pluginName, plugins, allPlugins),
      plugins: plugins
    })

    const returnValue = isObject(val) ? val : {}
    const merged = {
      ...currentActionValue,
      ...returnValue
    }

    const scopedPayload = payloads[pluginName] // || currentActionValue
    if (shouldAbort(scopedPayload, pluginName)) {
      // console.log(`>> HANDLE abort ${method} ${pluginName}`)
      abortDispatch({
        data: scopedPayload,
        method,
        instance,
        pluginName,
        store
      })
    } else {
      const nameSpaceEvent = `${method}:${pluginName}`
      const actionDepth = (nameSpaceEvent.match(/:/g) || []).length
      if (actionDepth < 2 && !method.match(bootstrapRegex) && !method.match(readyRegex)) {
        const updatedPayload = (isStartEvent) ? merged : payloadValue
        // Dispatched for `.on('xyz') listeners.
        instance.dispatch({
          ...updatedPayload,
          type: nameSpaceEvent,
          _: {
            called: nameSpaceEvent,
            from: 'submethod'
          }
        })
      }
    }
    // console.log('merged', merged)
    return Promise.resolve(merged)
  }, Promise.resolve(action))

  // Dispatch End. Make sure actions don't get double dispatched. EG userIdChanged
  if (!method.match(endsWithStartRegex) &&
      !method.match(/^registerPlugin/) &&
      // !method.match(/^disablePlugin/) &&
      // !method.match(/^enablePlugin/) &&
      !method.match(readyRegex) &&
      !method.match(bootstrapRegex) &&
      !method.match(/^params/) &&
      !method.match(/^userIdChanged/)
  ) {
    if (EVENTS.plugins.includes(method)) {
      // console.log(`Dont dispatch for ${method}`, resolvedAction)
      // return resolvedAction
    }
    /*
      Verify this original action setup.
      It's intended to keep actions from double dispatching themselves
    */
    if (resolvedAction._ && resolvedAction._.originalAction === method) {
      // console.log(`Dont dispatch for ${method}`, resolvedAction)
      return resolvedAction
    }

    let endAction = {
      ...resolvedAction,
      ...{
        _: {
          originalAction: resolvedAction.type,
          called: resolvedAction.type,
          from: 'engineEnd'
        }
      }
    }

    /* If all plugins are aborted, dispatch xAborted */
    if (shouldAbortAll(resolvedAction, data.exact.length) && !method.match(/End$/)) {
      endAction = {
        ...endAction,
        ...{
          type: resolvedAction.type + 'Aborted',
        }
      }
    }

    store.dispatch(endAction)
  }

  return resolvedAction
}

function abortDispatch({ data, method, instance, pluginName, store }) {
  const postFix = (pluginName) ? ':' + pluginName : ''
  const abortEvent = method + 'Aborted' + postFix
  store.dispatch({
    ...data,
    type: abortEvent,
    _: {
      called: abortEvent,
      from: 'abort'
    }
  })
}

function getConfig(name, pluginState, allPlugins) {
  const pluginData = pluginState[name] || allPlugins[name]
  if (pluginData && pluginData.config) {
    return pluginData.config
  }
  return {}
}

function getPluginFunctions(methodName, plugins) {
  return plugins.reduce((arr, plugin) => {
    return (!plugin[methodName]) ? arr : arr.concat({
      methodName: methodName,
      pluginName: plugin.name,
      method: plugin[methodName],
    })
  }, [])
}

function formatMethod(type) {
  return type.replace(endsWithStartRegex, '')
}

/**
 * Return array of event names
 * @param  {String} eventType - original event type
 * @param  {String} namespace - optional namespace postfix
 * @return {array} - type, method, end
 */
function getEventNames(eventType, namespace) {
  const method = formatMethod(eventType)
  const postFix = (namespace) ? `:${namespace}` : ''
  // `typeStart:pluginName`
  const type = `${eventType}${postFix}`
  // `type:pluginName`
  const methodName = `${method}${postFix}`
  // `typeEnd:pluginName`
  const end = `${method}End${postFix}`
  return [ type, methodName, end ]
}

/* Collect all calls for a given event in the system */
function getAllMatchingCalls(eventType, activePlugins, allPlugins) {
  const eventNames = getEventNames(eventType)
  // console.log('eventNames', eventNames)
  // 'eventStart', 'event', & `eventEnd`
  const core = eventNames.map((word) => {
    return getPluginFunctions(word, activePlugins)
  })
  // Gather nameSpaced Events
  return activePlugins.reduce((acc, plugin) => {
    const { name } = plugin
    const nameSpacedEvents = getEventNames(eventType, name)
    // console.log('eventNames namespaced', nameSpacedEvents)
    const [ beforeFuncs, duringFuncs, afterFuncs ] = nameSpacedEvents.map((word) => {
      return getPluginFunctions(word, activePlugins)
    })

    if (beforeFuncs.length) {
      acc.beforeNS[name] = beforeFuncs
    }
    if (duringFuncs.length) {
      acc.duringNS[name] = duringFuncs
    }
    if (afterFuncs.length) {
      acc.afterNS[name] = afterFuncs
    }
    return acc
  }, {
    before: core[0],
    beforeNS: {},
    during: core[1],
    duringNS: {},
    after: core[2],
    afterNS: {}
  })
}

function shouldAbort({ abort }, pluginName) {
  if (!abort) return false
  if (abort === true) return true
  return includes(abort, pluginName) || (abort && includes(abort.plugins, pluginName))
}

function shouldAbortAll({ abort }, pluginsCount) {
  if (!abort) return false
  if (abort === true || isString(abort)) return true
  const { plugins } = abort
  return (isArray(abort) && (abort.length === pluginsCount)) || (isArray(plugins) && (plugins.length === pluginsCount))
}

function isArray(arr) {
  return Array.isArray(arr)
}

function includes(arr, name) {
  if (!arr || !isArray(arr)) return false
  return arr.includes(name)
}

/**
 * Generate arguments to pass to plugin methods
 * @param  {Object} instance - analytics instance
 * @param  {array} abortablePlugins - plugins that can be cancelled by caller
 * @return {*} function to inject plugin params
 */
function argumentFactory(instance, abortablePlugins) {
  // console.log('abortablePlugins', abortablePlugins)
  return function (action, plugin, otherPlugin) {
    const { config, name } = plugin
    let method = `${name}.${action.type}`
    if (otherPlugin) {
      method = otherPlugin.event
    }

    const abortF = (action.type.match(endsWithStartRegex))
      ? abortFunction(name, method, abortablePlugins, otherPlugin, action)
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

function abortFunction(pluginName, method, abortablePlugins, otherPlugin, action) {
  return function (reason, plugins) {
    const caller = (otherPlugin) ? otherPlugin.name : pluginName
    let pluginsToAbort = (plugins && isArray(plugins)) ? plugins : abortablePlugins
    if (otherPlugin) {
      pluginsToAbort = (plugins && isArray(plugins)) ? plugins : [pluginName]
      if (!pluginsToAbort.includes(pluginName) || pluginsToAbort.length !== 1) {
        throw new Error(`Method ${method} can only abort ${pluginName} plugin. ${JSON.stringify(pluginsToAbort)} input valid`)
      }
    }
    return {
      ...action, // 🔥 todo verify this merge is ok
      abort: {
        reason: reason,
        plugins: pluginsToAbort,
        caller: method,
        _: caller
      }
    }
  }
}

function notAbortableError(action, method) {
  return () => {
    throw new Error(action.type + ' action not cancellable. Remove abort in ' + method)
  }
}

/**
 * Verify plugin is not calling itself with whatever:myPluginName self refs
 */
function validateMethod(actionName, pluginName) {
  const text = getNameSpacedAction(actionName)
  const methodCallMatchesPluginNamespace = text && (text.name === pluginName)
  if (methodCallMatchesPluginNamespace) {
    const sub = getNameSpacedAction(text.method)
    const subText = (sub) ? 'or ' + sub.method : ''
    throw new Error([ pluginName + ' plugin is calling method ' + actionName,
      'Plugins cant call self',
      `Use ${text.method} ${subText} in ${pluginName} plugin insteadof ${actionName}`]
      .join('\n')
    )
  }
}

function getNameSpacedAction(event) {
  const split = event.match(/(.*):(.*)/)
  if (!split) {
    return false
  }
  return {
    method: split[1],
    name: split[2],
  }
}

function formatPayload(action) {
  return Object.keys(action).reduce((acc, key) => {
    // redact type from { payload }
    if (key === 'type') {
      return acc
    }
    if (isObject(action[key])) {
      acc[key] = Object.assign({}, action[key])
    } else {
      acc[key] = action[key]
    }
    return acc
  }, {})
}

/*
function getMatchingMethods(eventType, activePlugins) {
  const exact = getPluginFunctions(eventType, activePlugins)
  // console.log('exact', exact)
  // Gather nameSpaced Events
  return activePlugins.reduce((acc, plugin) => {
    const { name } = plugin
    const clean = getPluginFunctions(`${eventType}:${name}`, activePlugins)
    if (clean.length) {
      acc.namespaced[name] = clean
    }
    return acc
  }, {
    exact: exact,
    namespaced: {}
  })
}
*/
