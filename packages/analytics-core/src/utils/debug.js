import { set, globalContext } from '@analytics/global-storage-utils'
import { compose } from '../vendor/redux'
import { LIBRARY_NAME, PREFIX } from './internalConstants'

export function Debug() {
  // initialize global history
  const globalVariable = PREFIX + LIBRARY_NAME + PREFIX
  // Global key is window.__analytics__
  set(globalVariable, [])
  // Return debugger
  return (createStore) => {
    return (reducer, preloadedState, enhancer) => {
      const store = createStore(reducer, preloadedState, enhancer)
      const origDispatch = store.dispatch
      const dispatch = (action) => {
        const a = action.action || action
        globalContext[globalVariable].push(a)
        return origDispatch(action)
      }
      return Object.assign(store, { dispatch: dispatch })
    }
  }
}

export function composeWithDebug(config) {
  return function () {
    return compose(compose.apply(null, arguments), Debug(config))
  }
}
