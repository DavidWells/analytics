// import undef from './undef'
/* global self globalThis */

export default function getGlobalThis() {
  if (typeof globalThis !== 'undefined') return globalThis
  if (typeof global !== 'undefined') return global
  if (typeof self !== 'undefined') return self /* eslint-disable-line no-restricted-globals */
  if (typeof window !== 'undefined') return window
  if (typeof this !== 'undefined') return this
  return {} // should never happen
}

/* tinier from https://github.com/purposeindustries/window-or-global/blob/master/lib/index.js
const context = (typeof self === 'object' && self.self === self && self) || // eslint-disable-line
  (typeof global === 'object' && global.global === global && global) ||
  this
export default context
*/
