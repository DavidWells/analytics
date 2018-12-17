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
  console.log('cache', cache)
  console.log('functions', functions)
  /* Filter out currently disabled plugins */
  const functionsToRun = filterDisabled(functions,
    instance.getState().plugins,
    action.options // options
  )
  console.log('functionsToRun', functionsToRun)
  return functionsToRun.reduce((acc, func) => {
    if (acc.abort) return acc
    const returnValue = func[action.type](action, instance)
    if (returnValue && typeof returnValue === 'object') {
      acc = Object.assign({}, acc, returnValue)
    }
    return acc
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
