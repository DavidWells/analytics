import { isFunction } from 'analytics-utils'

// Stack to temporarily hold deferred promises/callbacks
const stack = {}

/*
window.callBackStack = stack
/** */

function runCallback(id, payload) {
  if (stack[id] && isFunction(stack[id])) {
    // console.log(`run ${id}`)
    stack[id](payload)
    delete stack[id]
  }
}

export { stack, runCallback }