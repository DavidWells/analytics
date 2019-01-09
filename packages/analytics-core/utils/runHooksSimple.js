import getPluginByMethod from './getPluginByMethod'
import filterDisabled from './filterDisabled'
import EVENTS from '../events'
import Queue from './queue'

const testQ = new Queue()

function abortFunc(caller, allPlugins, method) {
  return function (msg, plugins) {
    return {
      caller: caller,
      abort: plugins || allPlugins,
      reason: msg,
      abortData: {
        caller: caller,
        method: method,
        reason: msg || 'NA'
      }
    }
  }
}

function abortNameSpacedFunc(caller, actionName, allPlugins, method) {
  return function (msg, plugins) {
    console.log('abort plugins', plugins, allPlugins[0])
    if (plugins && Array.isArray(plugins)) {
      if (!plugins.includes(allPlugins[0]) || plugins.length !== 1) {
        throw new Error(`Namespaced "${actionName}" action can only abort ${JSON.stringify(allPlugins)}`)
      }
    }
    return {
      caller: caller,
      abort: allPlugins,
      reason: msg,
      abortData: {
        plugin: caller,
        method: method,
        reason: msg || 'NA'
      }
    }
  }
}

let cache = {}
function resetCache() {
  cache = {}
}

export default function runSimpleHooks(action, instance, plugins, store) {
  const type = action.type
  const nested = type.match(/:/g) || []

  /* If action already dispatched exit early */
  if (action.ran) { // || type === 'pluginsRegistered'
    return action
  }

  /* certain plugins shouldnt dispatch again to avoid infinite  */
  const shouldDispatch = (
    type === 'ready' || type.match(/End$/) || type === 'pluginsRegistered'
  ) ? false : true // eslint-disable-line

  /* if call is name:thing stop. Was nested.length > 1 */
  // if (nested.length > 0) {
  //   return action
  // }
  // if (type === 'pageInit' || type === 'trackStart' || type === 'initialize' || type === 'hahaha' || type === 'ready') {

  let beforeMethods = []
  let coreName = type
  let completed = []
  let aborted = []

  if (type.match(/Start$/) || type.match(/Init/)) {
    beforeMethods = getPluginByMethod(type, plugins)
    // @TODO: 🔥 This shift in method call is causing "initlize:segment" to run more than once
    // It runs on `'InitializeStart' and again on matching type "initlize:segment"
    coreName = type.replace(/Start$/, '').replace(/Init$/, '')
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

  /* Grab current state to check if plugins are enabled */
  const state = instance.getState()

  /* Filter out currently disabled plugins */
  const activeBeforeMethods = filterDisabled(beforeMethods, state.plugins, action.options)

  console.log(`activeBeforeMethods type:${type} | core:${coreName}`, activeBeforeMethods)

  /* All ‘blankStart’ calls get processed */
  const actionBefore = activeBeforeMethods.reduce((newAction, plugin) => {
    if (newAction.abort) {
      // store.dispatch({
      //   type: `${type}Aborted`,
      //   plugins: theAction.abort,
      //   reason: theAction.reason,
      //   caller: theAction.caller,
      // })
      // return theAction
    }
    // Call methods. Only called 'WhateverStart'
    if (plugin[type] && typeof plugin[type] === 'function') {
      const returnValue = plugin[type]({
        action: newAction,
        instance: instance,
        config: plugin.config || {},
        abort: abortFunc(`${plugin.NAMESPACE}.${type}`, allKeys, type)
      })
      if (returnValue && typeof returnValue === 'object') {
        return Object.assign({}, newAction, returnValue)
      }
    }
    return newAction
  }, action)
  console.log('Action value: actionBefore', actionBefore)

  /* newActionValue contains abort. Stop everything else */
  if (shouldDispatch && actionBefore.abort && actionBefore.abort.length === allKeys.length) {
    store.dispatch({
      type: `${coreName}Aborted`,
      plugins: actionBefore.abort,
      reason: actionBefore.reason,
      caller: actionBefore.caller,
      abortData: actionBefore.abortData,
    })
    return actionBefore
  }

  let activeMethods = filterDisabled(allPluginMethodCalls, state.plugins, action.options)

  console.log(`activeMethods type:${type} | core:${coreName}`, activeMethods)
  // activeNameSpacedMethods

  const allNameSpacedCalls = activeMethods.reduce((acc, kind) => {
    const nsAction = `${coreName}:${kind.NAMESPACE}`
    console.log('nsActionx', nsAction)
    const nsActionOther = `${type}:${kind.NAMESPACE}`
    console.log('nsActiony', nsActionOther)
    const nsActionType = nsAction.match(/:/g) || []
    // Disable 'action:plugin:plugin' calls
    if (nsActionType.length > 1) {
      console.log(`${nsAction} ignored`)
      return acc
    }
    /* Look for hookStart:xyz & hook:xyz */
    let beforeNamespaceActions = []
    if (nsAction !== nsActionOther) {
      beforeNamespaceActions = getPluginByMethod(nsActionOther, plugins).map((p) => {
        return {
          event: nsActionOther,
          pluginName: p.NAMESPACE,
          func: p[nsActionOther]
        }
      })
    }

    const onlyFuncs = getPluginByMethod(nsAction, plugins).map((p) => {
      return {
        event: nsAction,
        pluginName: p.NAMESPACE,
        func: p[nsAction]
      }
    })

    const combinedFunctionsToRun = beforeNamespaceActions.concat(onlyFuncs)
    // const find = getPluginByMethod(nsAction, plugins) // Old only naming "method:name" not both ("methodStart:name" && "method:name")
    if (combinedFunctionsToRun.length) {
      // acc[kind.NAMESPACE] = find // oldTTTT
      acc[kind.NAMESPACE] = combinedFunctionsToRun // NEWWWW 🔥
    }
    return acc
  }, {})

  if (Object.keys(allNameSpacedCalls).length) {
    console.log(`FOUND NameSpaced Calls type:${type} | core:${coreName}`, allNameSpacedCalls)
  }

  // if (nested.length > 1) {
  //   allNameSpacedCalls = {}
  // }

  let payloads = {}

  console.log(`activeMethods.length type ${type}`, activeMethods.length)
  console.log(`activeMethods coreName ${coreName}`)
  // actionBefore
  const actionNameSpaced = activeMethods.reduce((newAction, plugin) => {
    // alert(`${typeof theAction.abort}`)
    if (shouldAbort(newAction, plugin.NAMESPACE)) {
      if (shouldDispatch) {
        store.dispatch({
          type: `${coreName}Aborted:${plugin.NAMESPACE}`,
          plugins: newAction.abort,
          reason: newAction.reason,
          caller: newAction.caller,
          abortData: newAction.abortData,
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
        if (accum.abort) {
          if (state.context.debug) {
            console.log(`"${nsPlugin.event}" method not called in ${nsPlugin.pluginName} plugin.`)
            console.log(`Reason: abort("${accum.reason}") from "${accum.caller}" plugin`)
          }
          return accum
        }

        let pluginReturnValue
        if (nsPlugin.func && typeof nsPlugin.func === 'function') {
          pluginReturnValue = nsPlugin.func({
            action: accum,
            instance: instance,
            config: plugin.config || {},
            abort: abortNameSpacedFunc(nsPlugin.pluginName, nsPlugin.event, [plugin.NAMESPACE], nsPlugin.event)
          })
        }

        if (pluginReturnValue && typeof pluginReturnValue === 'object') {
          if (pluginReturnValue.abort) { // @todo check array for name? maybe not bc u can only abort your namespace
            if (shouldDispatch) {
              store.dispatch({
                type: `${coreName}Aborted:${plugin.NAMESPACE}`,
                plugins: pluginReturnValue.abort,
                reason: pluginReturnValue.reason,
                caller: pluginReturnValue.caller,
                abortData: pluginReturnValue.abortData,
              })
            }
            // @TODO Append to aborted array here
            aborted = addToArray(aborted, plugin.NAMESPACE)
          }
          return Object.assign({}, accum, pluginReturnValue)
        }
        return accum
      }, newAction)

      /* `name:method` Abort() was called. Exit early */
      if (nameSpacedAction.abort) {
        // alert(`abort ${plugin.NAMESPACE}.${coreName} now`)
        return Object.assign({}, newAction, nameSpacedAction)
      }

      if (nameSpacedAction && typeof nameSpacedAction === 'object') {
        console.log(`specific plugin call: ${plugin.NAMESPACE}.${coreName} now`)
        console.log(`specific plugin call payload: ${JSON.stringify(nameSpacedAction)}`)

        /* Save plugin specific action payload. (If plugins have altered a specific call) */
        payloads[plugin.NAMESPACE] = nameSpacedAction

        // Return original action so we don't modify all calls
        return newAction // <--- Object.assign({}, theAction, nameSpacedAction)
      }
    }

    /* Save payload for specific calls */
    payloads[plugin.NAMESPACE] = Object.assign({}, newAction, {fromPayload: true})

    return newAction
  }, actionBefore)
  console.log('Action value: actionNameSpaced', actionNameSpaced)

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
  console.log(`coreMethodsToCall ${coreName}`, coreMethodsToCall)

  /**
     * Run final reducer over the core methods to call
     *
     * 1. Runs method['name'] with scoped payload
     * 2a. If method returns abort call, stop the flow
     * 2b. If no abort, continue over all
     * @type {[type]}
     */
  const actionFinal = coreMethodsToCall.reduce((newAction, plugin, i) => {
    // actionForSpecificPlugin pulled from previous reducer
    const actionForSpecificPlugin = payloads[plugin.NAMESPACE]
    const lastCall = coreMethodsToCall.length === (i + 1)

    if (shouldAbort(newAction, plugin.NAMESPACE)) {
      if (state.context.debug) {
        console.log(`method not called in ${plugin.NAMESPACE} plugin.`)
        console.log(`Reason: abort("${newAction.reason}") from "${newAction.caller}" plugin`)
      }
      if (newAction.abort && newAction.abort.length === allKeys.length) {
        console.log('Everything aborted', `${coreName}Aborted:${plugin.NAMESPACE}`)
        // @TODO figure out if you want to emit all the abort events
        // return newAction
      }
      if (shouldDispatch) {
        store.dispatch({
          type: `${coreName}Aborted:${plugin.NAMESPACE}`,
          plugins: newAction.abort,
          reason: newAction.reason,
          caller: newAction.caller,
          abortData: newAction.abortData,
        })
      }

      // @TODO Append to aborted array here
      // aborted = aborted.concat(plugin.NAMESPACE)
      aborted = addToArray(aborted, plugin.NAMESPACE)

      if (shouldDispatch && lastCall) { // && !type.match(/End$/)
        store.dispatch({
          type: `${coreName}End`,
          aborted: aborted, // TODO fix this array
          completed: completed,
          ...cleanAction(newAction),
        })
      }
      return newAction
    }

    let cleanedAction = cleanAction(actionForSpecificPlugin)
    let pluginReturnValue
    if (plugin[coreName] && typeof plugin[coreName] === 'function') {
      if (coreName === 'ready:vanilla') {
        alert(`Call ${coreName} function on ${plugin.NAMESPACE} in coreMethodsToCall. Action type: ${type}`)
      }
      pluginReturnValue = plugin[coreName]({
        action: cleanedAction,
        instance: instance,
        config: plugin.config || {},
        abort: abortFunc(`${plugin.NAMESPACE}.${coreName}`, allKeys, coreName)
      })
    }

    completed = addToArray(completed, plugin.NAMESPACE)

    const nameSpacedEvent = `${coreName}:${plugin.NAMESPACE}`
    const count = nameSpacedEvent.match(/:/g) || []

    if (shouldDispatch && count.length < 3) {
      const x = allNameSpacedCalls[plugin.NAMESPACE] || []
      const y = x.map((thing) => {
        return thing.NAMESPACE
      })
      store.dispatch({
        type: nameSpacedEvent,
        x: y,
        // ran: true,
        ...cleanedAction,
      })
    }

    if (pluginReturnValue && typeof pluginReturnValue === 'object') {
      if (pluginReturnValue.abort && pluginReturnValue.abort.length === allKeys.length) {
        if (shouldDispatch) {
          store.dispatch({
            type: `${coreName}Aborted`,
            plugins: pluginReturnValue.abort,
            reason: pluginReturnValue.reason,
            caller: pluginReturnValue.caller,
            abortData: pluginReturnValue.abortData,
          })
        }
      }
    }

    // Only emit end events on 'name' and 'name:plugin' events
    if (shouldDispatch && lastCall && count.length < 2 ) { // && !type.match(/End$/)
      if (isCoreMethod(coreName)) {
        store.dispatch({
          type: `${coreName}`,
          ran: true,
          ...cleanedAction,
        })
      }
      store.dispatch({
        type: `${coreName}End`,
        aborted: aborted, // TODO fix this array
        completed: completed,
        ...cleanedAction,
      })
    }
    const stub = (pluginReturnValue && typeof pluginReturnValue === 'object') ? pluginReturnValue : {}
    return Object.assign({}, newAction, stub)
    // return newAction
  }, actionNameSpaced)
  console.log('Action value: actionFinal', actionFinal)
  return actionFinal
}

function addToArray(arr, name) {
  if (!arr.includes(name)) {
    return arr.concat(name)
  }
  return arr
}

function cleanAction(action) {
  const newAction = Object.assign({}, action)
  delete newAction.type
  delete newAction.abort
  delete newAction.reason
  delete newAction.caller
  delete newAction.abortData
  return newAction
}

function shouldAbort(action, name) {
  return action && action.abort && Array.isArray(action.abort) && action.abort.includes(name)
}

// function runCompleted(lastCall, isNameSpaced, store){
//   if (lastCall && !isNameSpaced) {
//     store.dispatch({
//       type: `${type}Completed`,
//       completed: completed,
//       aborted: aborted
//     })
//   }
// }

function isCoreMethod(type) {
  const core = [
    'initialize',
    'page',
    'track',
    'indentify'
  ]
  return core.includes(type)
}

function nameSpacedAction(type) {
  const split = type.match(/(.*):(.*)/)
  if (!split) {
    return false
  }
  return {
    name: split[2],
    method: split[1]
  }
}

function waitForReady(data, predicate, timeout) {
  return new Promise((resolve, reject) => {
    if (predicate()) {
      return resolve(data)
    }
    // Timeout. Add to queue
    if (timeout < 1) {
      return reject({ ...data, queue: true }) // eslint-disable-line
    }
    // Else recursive retry
    return pause(10).then(_ => {
      return waitForReady(data, predicate, timeout - 10).then(resolve, reject)
    })
  })
}

function pause(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

setInterval(() => {
  // console.log('testQ', testQ)
  // console.log('testQ items', testQ.get())
}, 1000)
