import { compose } from 'redux'
import globalContext from './global'

export function Debug() {
  const config = arguments[0] || {} // eslint-disable-line
  // initialize global history
  const k = '__ANALYTICS_HISTORY__'
  globalContext[k] = []
  return (createStore) => {
    return (reducer, preloadedState, enhancer) => {
      const store = createStore(reducer, preloadedState, enhancer)
      const origDispatch = store.dispatch
      const dispatch = (action) => {
        const a = action.action || action
        globalContext[k].push(a)
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
