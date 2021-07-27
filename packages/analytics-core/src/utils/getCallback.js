import { isFunction, isArray } from '@analytics/type-utils'

export default function getCallbackFromArgs(argArray) {
  let cb
  const args = isArray(argArray) ? argArray : Array.prototype.slice.call(arguments)
  for (let i = 0; i < args.length; i++) {
    if (isFunction(args[i])) cb = args[i]; break;
  }
  return cb
}