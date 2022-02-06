import { set, globalContext, KEY } from '@analytics/global-storage-utils'
import { compose } from '../vendor/redux'
import { LIB_NAME } from './internalConstants'

export function Debug() {
  // Global key is window.__global__.analytics
  set(LIB_NAME, [])
  // Return debugger
  return (createStore) => {
    return (reducer, preloadedState, enhancer) => {
      const store = createStore(reducer, preloadedState, enhancer)
      const origDispatch = store.dispatch
      const dispatch = (action) => {
        const a = action.action || action
        globalContext[KEY][LIB_NAME].push(a)
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
