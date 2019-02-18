// import getPluginByMethod from '../../utils/getPluginByMethod'
import fitlerDisabledPlugins from '../../utils/filterDisabled'
// import waitForReady from '../../utils/waitForReady'

export default async function (action, getPlugins, instance, store) {
  const pluginObject = getPlugins()
  const eventType = action.type
  /* If action already dispatched exit early */
  if (action.meta && action.meta.called) {
    // This makes it so plugin methods dont get fired twice.
    return action
  }

  // const actionDepth = (eventType.match(/:/g) || []).length
  // if (actionDepth > 2) {
  //   return action
  // }
  const state = instance.getState()

  /* Remove plugins that are disabled by options or by settings */
  const activePlugins = fitlerDisabledPlugins(pluginObject, state.plugins, action.options)
  const allActivePluginKeys = activePlugins.map((p) => p.NAMESPACE)

  // console.log('allActivePluginKeys', allActivePluginKeys)
  // console.log('allActivePluginKeys.length', allActivePluginKeys.length)
  // console.log('activePlugins', activePlugins)

  /* Gather and process all matching methods from plugins */
  // const matchingMethods = getCalls(eventType, activePlugins, pluginObject)
  // console.log(`matchingMethods:${eventType}`, matchingMethods)

  const cleanMatch = getMatchingMethods(eventType, activePlugins)
  // console.log(`cleanMatch:${eventType}`, cleanMatch)
  /**
   * .🔥 🔥 Design processEvents API
   * You have all the events in matchingMethods refactor how it works
   * It creates a namepaced payload and fires the given
   */
  const beforeAction = await processEvent({
    action: action,
    data: cleanMatch,
    state: state,
    allPlugins: pluginObject,
    instance,
    store
  })
  // console.log('____ beforeAction out', beforeAction)

  /* Abort if ‘eventBefore’ returns abort data */
  if (shouldAbortAll(beforeAction, allActivePluginKeys.length)) {
    return beforeAction
  }

  /* Filter over the plugin method calls and remove aborted plugin by name */
  const activeAndNonAbortedCalls = activePlugins.filter((plugin) => {
    if (shouldAbort(beforeAction, plugin.NAMESPACE)) return false
    return true
  })

  // console.log(`activeAndNonAbortedCalls ${action.type}`, activeAndNonAbortedCalls)
  const duringType = eventType.replace(/Start$/, '')
  const duringMethods = getMatchingMethods(eventType.replace(/Start$/, ''), activePlugins)

  /* Already processed and ran these methods */
  if (duringType === eventType) {
    // console.log('NAMES MATCH Dont process again', duringType, eventType)
  }

  const duringAction = (duringType === eventType) ? beforeAction : await processEvent({
    action: {
      ...beforeAction,
      type: formatMethod(eventType)
    },
    data: duringMethods,
    state: state,
    allPlugins: pluginObject,
    instance,
    store
  })
  // console.log('____ duringAction', duringAction)

  const afterName = `${formatMethod(eventType)}End`
  const afterAction = await processEvent({
    action: {
      ...duringAction,
      type: afterName
    },
    data: getMatchingMethods(afterName, activePlugins),
    state: state,
    allPlugins: pluginObject,
    instance,
    store
  })
  // console.log('____ afterAction', afterAction)

  /* Fire callback if supplied */
  const cb = getCallback(afterAction)
  if (cb) {
    /** @TODO figure out exact args calls and .on will get */
    cb({ payload: afterAction }) // eslint-disable-line
  }

  return beforeAction
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
  store
}) {
  const { plugins } = state
  const method = action.type
  // console.log('datadatadata PROCESS', method)
  // console.log('datadatadata', data)

  /* generate plugin specific payloads */
  const payloads = await data.exact.reduce(async (scoped, curr, i) => {
    const { pluginName } = curr
    const curScope = await scoped
    if (data.namespaced && data.namespaced[pluginName]) {
      const scopedPayload = await data.namespaced[pluginName].reduce(async (acc, p, count) => {
        // await value
        const curScopeData = await acc
        if (!p.method || typeof p.method !== 'function') {
          return curScopeData
        }

        const val = await p.method({
          payload: curScopeData,
          instance,
          config: getConfig(pluginName, plugins, allPlugins),
        })
        const returnValue = (typeof val === 'object') ? val : {}
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
    const payloadValue = (payloads[pluginName]) ? payloads[pluginName] : {}
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
    /* Run the plugin function */
    const val = await currentPlugin[method]({
      hello: pluginName,
      // Send in original action value or scope payload
      payload: payloads[pluginName], // || currentActionValue,
      instance,
      config: getConfig(pluginName, plugins, allPlugins),
    })

    const returnValue = (typeof val === 'object') ? val : {}
    const merged = {
      ...currentActionValue,
      ...returnValue
    }

    const x = payloads[pluginName] // || currentActionValue
    if (shouldAbort(x, pluginName)) {
      // console.log(`>> HANDLE abort ${method} ${pluginName}`)
      abortDispatch({
        data: x,
        method,
        instance,
        pluginName,
        store
      })
    } else {
      const tttt = `${method}:${pluginName}`
      const actionDepth = (tttt.match(/:/g) || []).length
      if (actionDepth < 2 &&
        !method.match(/^bootstrap/) &&
        !method.match(/^ready/)
      ) {
        instance.dispatch({
          ...x,
          type: `${method}:${pluginName}`,
          meta: {
            called: true,
            subMethod: true,
          },
        })
      }
    }
    // console.log('merged', merged)
    return Promise.resolve(merged)
  }, Promise.resolve(action))

  // Dispatch End
  if (!method.match(/Start$/) &&
      !method.match(/^registerPlugin/) &&
      !method.match(/^ready/) &&
      !method.match(/^bootstrap/)
  ) {
    store.dispatch({
      ...resolvedAction,
      ...{
        meta: {
          called: true
        }
      }
    })
  }

  return resolvedAction
}

function abortDispatch({ data, method, instance, pluginName, store }) {
  const postFix = (pluginName) ? `:${pluginName}` : ''
  store.dispatch({
    ...data,
    type: `${method}Aborted${postFix}`,
    meta: {
      called: true
    },
  })
}

function getConfig(pluginName, pluginState, allPlugins) {
  if (pluginState[pluginName] && pluginState[pluginName].config) {
    return pluginState[pluginName].config
  }
  if (allPlugins[pluginName] && allPlugins[pluginName].config) {
    return allPlugins[pluginName].config
  }
  return {}
}

function getPluginFunctions(methodName, plugins) {
  return plugins.reduce((arr, plugin) => {
    return (!plugin[methodName]) ? arr : arr.concat({
      methodName: methodName,
      pluginName: plugin.NAMESPACE,
      method: plugin[methodName],
    })
  }, [])
}

function formatMethod(type) {
  return type.replace(/Start$/, '')
}

/**
 * Return array of event names
 * @param  {String} eventType - original event type
 * @param  {String} namespace - optional namespace postfix
 * @return {[type]}           [description]
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
  console.log('eventNames', eventNames)
  // 'eventStart', 'event', & `eventEnd`
  const core = eventNames.map((word) => {
    return getPluginFunctions(word, activePlugins)
  })
  // Gather nameSpaced Events
  return activePlugins.reduce((acc, plugin) => {
    const { NAMESPACE } = plugin
    const nameSpacedEvents = getEventNames(eventType, NAMESPACE)
    console.log('eventNames namespaced', nameSpacedEvents)
    const [ beforeFuncs, duringFuncs, afterFuncs ] = nameSpacedEvents.map((word) => {
      return getPluginFunctions(word, activePlugins)
    })

    if (beforeFuncs.length) {
      acc.beforeNS[NAMESPACE] = beforeFuncs
    }
    if (duringFuncs.length) {
      acc.duringNS[NAMESPACE] = duringFuncs
    }
    if (afterFuncs.length) {
      acc.afterNS[NAMESPACE] = afterFuncs
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

function getMatchingMethods(eventType, activePlugins) {
  const exact = getPluginFunctions(eventType, activePlugins)
  // console.log('exact', exact)
  // Gather nameSpaced Events
  return activePlugins.reduce((acc, plugin) => {
    const { NAMESPACE } = plugin
    const clean = getPluginFunctions(`${eventType}:${NAMESPACE}`, activePlugins)
    if (clean.length) {
      acc.namespaced[NAMESPACE] = clean
    }
    return acc
  }, {
    exact: exact,
    namespaced: {}
  })
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
