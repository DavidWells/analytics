import { isBrowser } from '@analytics/type-utils'
import { paramsClean } from './paramsClean'

/**
 * Removes params from url in browser
 * @param  {string}   param       - param key to remove from current URL
 * @param  {() => void} [callback]  - callback function to run. Only runs in browser
 * @return {PromiseLike<void>}
 */
export function paramsRemove(param, callback) {
  if (!isBrowser) return Promise.resolve()

  return new Promise((resolve, reject) => {
    if (window.history && window.history.replaceState) {
      const url = window.location.href
      const cleanUrl = paramsClean(url, param)
      if (url !== cleanUrl) {
        /* replace URL with history API */
        // eslint-disable-next-line no-restricted-globals
        history.replaceState({}, '', cleanUrl)
      }
    }

    if (callback) callback()

    return resolve()
  })
}
