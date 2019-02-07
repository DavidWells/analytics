import getPluginByMethod from '../../utils/getPluginByMethod'
import filterDisabled from '../../utils/filterDisabled'
import waitForReady from '../../utils/waitForReady'

function formatMethod(type) {
  return type.replace(/Start$/, '')
}

function fitlerDisabledPlugins(allPlugins, settings = {}, options = {}) {
  return Object.keys(allPlugins).filter((name) => {
    const { plugins } = options
    const pluginsFromOpt = plugins || {}
    if (pluginsFromOpt[name] === false) {
      return false
    }
    // If enabled by options. Overide settings
    if (pluginsFromOpt[name] === true) {
      return true
    }
    // else use state.plugin settings
    if (settings[name] && settings[name].enabled === false) {
      return false
    }
    return true
  }).map((name) => allPlugins[name])
}

let order = []
window.order = order
export default async function (action, pluginObject, instance, store) {
  order.push(action.type)
  const eventType = action.type
  // const actionDepth = (eventType.match(/:/g) || []).length
  // if (actionDepth > 2) {
  //   return action
  // }
  const state = instance.getState()

  /* Remove plugins that are disabled by options or by settings */
  const activePlugins = fitlerDisabledPlugins(pluginObject, state.plugins, action.options)
  const allActivePluginKeys = activePlugins.map((p) => p.NAMESPACE)

  console.log('allActivePluginKeys', allActivePluginKeys)
  console.log('allActivePluginKeys.length', allActivePluginKeys.length)
  console.log('activePlugins', activePlugins)

  /* Gather and process all matching methods from plugins */
  // const matchingMethods = getCalls(eventType, activePlugins, pluginObject)

  const cleanMatch = getCallsClean(eventType, activePlugins)
  console.log('cleanMatch', cleanMatch)
  /**
   * .🔥 🔥 Design processEvents API
   * You have all the events in matchingMethods refactor how it works
   * It creates a namepaced payload and fires the given
   */

  const beforeAction = await processEventsClean({
    action: action,
    data: cleanMatch,
    state: state,
    allPlugins: pluginObject,
    instance,
  })
  console.log('beforeAction', beforeAction)

  /* Abort if ‘eventBefore’ returns abort data */
  if (shouldAbortAll(beforeAction, allActivePluginKeys.length)) {
    alert('abort all plugins')
    return beforeAction
  }

  /* Filter over the plugin method calls and remove aborted plugin by name */
  const activeAndNonAbortedCalls = activePlugins.filter((plugin) => {
    if (shouldAbort(beforeAction, plugin.NAMESPACE)) return false
    return true
  })

  console.log(`activeAndNonAbortedCalls ${action.type}`, activeAndNonAbortedCalls)

  let shouldDispatch = eventType.match(/Start$/)
  const hasEnd = eventType.match(/End/)

  if (shouldDispatch) {
    store.dispatch({
      ...beforeAction,
      type: formatMethod(action.type),
      meta: {
        called: true,
        hasEnd: (hasEnd) ? false : true
      },
    })
  }

  if (!hasEnd && action.meta && action.meta.hasEnd) {
    store.dispatch({
      type: `${action.type}End`,
      meta: {
        called: true,
      },
    })
  }

  return beforeAction
}

var processEventsClean = async ({
  data,
  action,
  instance,
  state,
  allPlugins
}) => {
  const { plugins } = state
  const method = action.type
  console.log('datadatadata', data)
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
    }
    return Promise.resolve(curScope)
  }, Promise.resolve({}))
  console.log('scoped payloads', payloads)

  // Then call the normal methods with scoped payload
  const resolvedAction = await data.exact.reduce(async (promise, curr, i) => {
    const lastLoop = data.exact.length === (i + 1)
    const { pluginName } = curr
    const currentPlugin = allPlugins[pluginName]
    const currentActionValue = await promise
    const payloadValue = (payloads[pluginName]) ? payloads[pluginName] : {}
    if (shouldAbort(payloadValue, pluginName)) {
      console.log(`> Abort from payload specific "${pluginName}" abort value`, payloadValue)
      abortDispatch(payloadValue, method, instance, pluginName)
      return Promise.resolve(currentActionValue)
    }
    if (shouldAbort(currentActionValue, pluginName)) {
      console.log(`> Abort from ${method} abort value`, currentActionValue)
      if (lastLoop) {
        abortDispatch(currentActionValue, method, instance)
      }
      return Promise.resolve(currentActionValue)
    }
    /* Run the plugin function */
    const val = await currentPlugin[method]({
      payload: payloads[pluginName] || currentActionValue,
      instance,
      config: getConfig(pluginName, plugins, allPlugins),
    })

    const returnValue = (typeof val === 'object') ? val : {}
    const merged = {
      ...currentActionValue,
      ...returnValue
    }
    const x = payloads[pluginName] || currentActionValue
    if (shouldAbort(x, pluginName)) {
      console.log(`>> HANDLE abort ${method} ${pluginName}`)
      abortDispatch(x, method, instance, pluginName)
    } else {
      const tttt = `${method}:${pluginName}`
      console.log('tttt', tttt)
      const actionDepth = (tttt.match(/:/g) || []).length
      if (actionDepth < 2) {
        instance.dispatch({
          ...x,
          type: `${method}:${pluginName}`,
          meta: {
            called: true
          },
        })
      }
    }
    console.log('merged', merged)
    return Promise.resolve(merged)
  }, Promise.resolve(action))

  return resolvedAction
}

function abortDispatch(data, method, instance, pluginName) {
  const postFix = (pluginName) ? `:${pluginName}` : ''
  instance.dispatch({
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
function getCalls(eventType, activePlugins, allPlugins) {
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

function getCallsClean(eventType, activePlugins) {
  const exact = getPluginFunctions(eventType, activePlugins)
  console.log('exact', exact)
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
