import { isFunction } from 'analytics-utils'

export default function getCallbackFromArgs(argArray) {
  const processArray = argArray || Array.prototype.slice.call(arguments)
  return processArray.reduce((acc, arg) => {
    if (acc) return acc
    if (isFunction(arg)) {
      return arg
    }
    return acc
  }, false)
}
