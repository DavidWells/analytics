/* from https://github.com/purposeindustries/window-or-global/blob/master/lib/index.js */

// const context = (typeof self === 'object' && self.self === self && self) || // eslint-disable-line
//   (typeof global === 'object' && global.global === global && global) ||
//   this
//
// export default context

/* global self globalThis */

const getGlobal = () => {
  /* eslint-disable */
  if (typeof self !== 'undefined' && self) {
    return self
  }
  /* eslint-enable */

  if (typeof window !== 'undefined' && window) {
    return window
  }

  if (typeof global !== 'undefined' && global) {
    return global
  }

  if (typeof globalThis !== 'undefined' && globalThis) {
    return globalThis
  }
}

export default getGlobal()
