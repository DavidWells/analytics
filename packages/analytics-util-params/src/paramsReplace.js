import noOp from './utils/noOp'
import stripParams from './paramsClean'

/**
 * Removes params from URL in browser
 * @param  {string} param - param key to remove from current URL
 * @return {promise}
 */
function paramsReplace(param) {
  if (window.history && window.history.replaceState) {
    const url = window.location.href
    const cleanUrl = stripParams(url, param)
    if (url !== cleanUrl) {
      /* replace URL with history API */
      // eslint-disable-next-line no-restricted-globals
      history.replaceState({}, '', cleanUrl)
    }
  }
}

export default (process.browser) ? paramsReplace : noOp
