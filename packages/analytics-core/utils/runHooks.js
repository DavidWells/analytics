import getPluginByMethod from './getPluginByMethod'
import filterDisabled from './filterDisabled'

const cache = {}

export default function runHooks(action, instance, plugins) {
  // memomize lookup
  let functions = cache[action.type]
  if (!functions) {
    functions = getPluginByMethod(action.type, plugins)
    cache[action.type] = functions
    // TODO bust cache when enable/disable runs
  }
  // console.log('cache', cache)
  // console.log('functions', functions)
  const state = instance.getState()
  /* Filter out currently disabled plugins */
  const functionsToRun = filterDisabled(functions,
    state.plugins,
    action.options // options
  )
  // console.log('functionsToRun', functionsToRun)
  return functionsToRun.reduce((modifiedAction, func) => {
    if (modifiedAction.abort) return modifiedAction
    const returnValue = func[action.type](modifiedAction, instance)
    if (returnValue && typeof returnValue === 'object') {
      modifiedAction = Object.assign({}, modifiedAction, returnValue)
      if (state.context.debug) {
        console.log(`Action modification on "${action.type}" action from ${func.NAMESPACE}`, returnValue)
        console.log('Original action', action)
        console.log('Modified action', modifiedAction)
      }
    }
    return modifiedAction
  }, action)
}

/* old simple

export default function runHooks(action, instance, plugins) {
  // memomize lookup
  let functions = cache[action.type]
  if (!functions) {
    functions = getPluginByMethod(action.type, plugins)
    cache[action.type] = functions
  }
  return functions.map((func) => {
    return func[action.type](action, instance)
  })
}

*/
