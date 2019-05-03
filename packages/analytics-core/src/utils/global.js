/* from https://github.com/purposeindustries/window-or-global/blob/master/lib/index.js */

const context = (typeof self === 'object' && self.self === self && self) || // eslint-disable-line
  (typeof global === 'object' && global.global === global && global) ||
  this

export default context
