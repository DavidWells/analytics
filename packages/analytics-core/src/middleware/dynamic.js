/* forked from https://github.com/pofigizm/redux-dynamic-middlewares/ */
import { compose } from 'redux'

let before = []
let after = []

const dynamicMiddlewares = (positionBefore) => {
  return store => next => action => {
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (act) => store.dispatch(act),
    }
    const middlewareChain = (positionBefore) ? before : after
    const chain = middlewareChain.map(middleware => middleware(middlewareAPI))
    return compose(...chain)(next)(action)
  }
}

export const addMiddleware = (middlewares, positionBefore) => {
  if (positionBefore) {
    before = before.concat(middlewares)
  } else {
    after = after.concat(middlewares)
  }
}

export const removeMiddleware = (middleware, positionBefore) => {
  const middlewareChain = (positionBefore) ? before : after
  const index = middlewareChain.findIndex(d => d === middleware)
  if (index === -1) return

  if (positionBefore) {
    before = [
      ...before.slice(0, index),
      ...before.slice(index + 1),
    ]
  } else {
    after = [
      ...after.slice(0, index),
      ...after.slice(index + 1),
    ]
  }
}

export const newresetMiddlewares = (positionBefore) => {
  if (positionBefore) {
    before = []
  } else {
    after = []
  }
}

export default dynamicMiddlewares
