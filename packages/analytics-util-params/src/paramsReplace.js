import noOp from './utils/noOp'
import paramsClean from './paramsClean'

/**
 * Removes params from URL in browser
 * @param  {string|RegExp} param - parameter to replace. String or regex pattern
 */
function paramsReplace(param) {
  /* replace URL with history API */
  if (window.history && window.history.replaceState) {
    const url = window.location.href
    const cleanUrl = paramsClean(url, param)
    if (url !== cleanUrl) {
      // eslint-disable-next-line no-restricted-globals
      history.replaceState({}, '', cleanUrl)
    }
  }
}

export default (process.browser) ? paramsReplace : noOp
