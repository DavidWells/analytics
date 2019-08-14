import noOp from './utils/noOp'
import paramsClean from './clean'

/**
 * Removes params from URL in browser
 * @param  {string} param - param key to remove from current URL
 * @return {promise}
 */
function paramsRemove(param) {
  if (window.history && window.history.replaceState) {
    const url = window.location.href
    const cleanUrl = paramsClean(url, param)
    if (url !== cleanUrl) {
      /* replace URL with history API */
      // eslint-disable-next-line no-restricted-globals
      history.replaceState({}, '', cleanUrl)
    }
  }
}

export default (process.browser) ? paramsRemove : noOp
