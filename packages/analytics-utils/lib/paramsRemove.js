import inBrowser from './inBrowser'
import paramsClean from './paramsClean'

/**
 * Removes params from url in browser
 * @param  {string}   param       - param string to remove
 * @param  {function} [callback]  - callback function to run
 * @return {promise}
 */
export default function paramsRemove(param, callback) {
  return new Promise((resolve, reject) => {
    if (inBrowser && window.history && window.history.replaceState) {
      const url = window.location.href
      const cleanUrl = paramsClean(url, param)
      if (url !== cleanUrl) {
        // replace URL
        history.replaceState({}, '', cleanUrl) // eslint-disable-line
      }
    }

    if (callback) {
      callback()
    }

    return resolve()
  })
}
