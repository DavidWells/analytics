/* from https://github.com/purposeindustries/window-or-global/blob/master/lib/index.js */

// const context = (typeof self === 'object' && self.self === self && self) || // eslint-disable-line
//   (typeof global === 'object' && global.global === global && global) ||
//   this
//
// export default context
import inBrowser from './inBrowser'
/* global self globalThis */

const getGlobal = () => {
  /* eslint-disable */
  if (typeof self !== 'undefined' && self) {
    return self
  }
  /* eslint-enable */

  if (inBrowser && window) {
    return window
  }

  if (inBrowser && global) {
    return global
  }

  if (typeof globalThis !== 'undefined' && globalThis) {
    return globalThis
  }
}

export default getGlobal()
