import { isFunction } from '@analytics/type-utils'

/**
 * Grab first function found from arguments
 * @param {array} [argArray] - arguments array to find first function
 * @returns {Function|undefined}
 */
export default function getCallbackFromArgs(argArray) {
  const args = argArray || Array.prototype.slice.call(arguments)
  let cb
  for (let i = 0; i < args.length; i++) {
    if (isFunction(args[i])) {
      cb = args[i]; break;
    }
  }
  return cb
}