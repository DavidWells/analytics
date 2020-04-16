import { compose } from '../vendor/redux'

/* Class to fix dynamic middlewares from conflicting with each other
if more than one analytic instance is active */
export default class DynamicMiddleware {
  before = []
  after = []
  addMiddleware = (middlewares, position) => {
    this[position] = this[position].concat(middlewares)
  }
  removeMiddleware = (middleware, position) => {
    const index = this[position].findIndex(d => d === middleware)
    if (index === -1) return

    this[position] = [
      ...this[position].slice(0, index),
      ...this[position].slice(index + 1),
    ]
  }
  /* Not currently in use
  resetMiddlewares = (position) => {
    if (!position) {
      this.before = []
      this.after = []
    } else {
      this[position] = []
    }
  }
  */
  dynamicMiddlewares = (position) => {
    return store => next => action => {
      const middlewareAPI = {
        getState: store.getState,
        dispatch: (act) => store.dispatch(act),
      }
      const chain = this[position].map(middleware => middleware(middlewareAPI))
      return compose(...chain)(next)(action)
    }
  }
}
