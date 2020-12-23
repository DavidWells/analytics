import { isFunction } from 'analytics-utils'

// Stack to temporarily hold callbacks
const stack = {}

function runCallback(id, payload) {
  if (stack[id] && isFunction(stack[id])) {
    stack[id](payload)
    delete stack[id]
  }
}

export { stack, runCallback }