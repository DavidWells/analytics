import globalContext from './global'
import { compose } from '../vendor/redux'
import { LIBRARY_NAME } from './_constants'

export function Debug() {
  const config = arguments[0] || {} // eslint-disable-line
  // initialize global history
  const prePostFix = '__'
  // __analytics__
  const globalVariable = prePostFix + LIBRARY_NAME + prePostFix
  globalContext[globalVariable] = []
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
