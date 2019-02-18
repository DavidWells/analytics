import { compose } from 'redux'

export function Debug() {
  const config = arguments[0] || {} // eslint-disable-line
  // initialize global history
  if (process.browser) window.__ANALYTICS_HISTORY__ = []
  return (createStore) => {
    return (reducer, preloadedState, enhancer) => {
      const store = createStore(reducer, preloadedState, enhancer)
      const origDispatch = store.dispatch
      const dispatch = (action) => {
        const a = action.action || action
        if (process.browser) {
          window.__ANALYTICS_HISTORY__.push(a)
        }
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
