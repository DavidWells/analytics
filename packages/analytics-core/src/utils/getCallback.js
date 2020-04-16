import { isFunction } from 'analytics-utils'

export default function getCallbackFromArgs() {
  return Array.prototype.slice.call(arguments).reduce((acc, arg) => {
    if (acc) return acc
    if (isFunction(arg)) {
      return arg
    }
    return acc
  }, false)
}
