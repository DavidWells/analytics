import { isFunction } from '@analytics/type-utils'

// Stack to temporarily hold deferred promises/callbacks
const stack = {}

function runCallback(id, payload) {
  if (stack[id] && isFunction(stack[id])) {
    // console.log(`run ${id}`)
    stack[id](payload)
    delete stack[id]
  }
}

export { stack, runCallback }