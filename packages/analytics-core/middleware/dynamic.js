/* via https://github.com/pofigizm/redux-dynamic-middlewares/ */
import { compose } from 'redux'

let dynamic = []

const dynamicMiddlewares = store => next => action => {
  const middlewareAPI = {
    getState: store.getState,
    dispatch: (act) => store.dispatch(act),
  }
  const chain = dynamic.map(middleware => middleware(middlewareAPI))
  return compose(...chain)(next)(action)
}

export const addMiddleware = (...middlewares) => {
  dynamic = dynamic.concat(...middlewares)
}

export const removeMiddleware = middleware => {
  const index = dynamic.findIndex(d => d === middleware)
  if (index === -1) return

  dynamic = [
    ...dynamic.slice(0, index),
    ...dynamic.slice(index + 1),
  ]
}

export const resetMiddlewares = () => {
  dynamic = []
}

export default dynamicMiddlewares
