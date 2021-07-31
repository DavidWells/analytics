import { isBrowser, isString, isRegex } from '@analytics/type-utils'

/**
 * Check if a script is loaded
 * @param  {String|RegExp} script - Script src as string or regex
 * @return {Boolean} is script loaded
 */
export function isScriptLoaded(script) {
  if (!isBrowser) return true
  const scripts = document.getElementsByTagName('script')
  return !!Object.keys(scripts).filter((key) => {
    const { src } = scripts[key]
    if (isString(script)) {
      return src.indexOf(script) !== -1
    } else if (isRegex(script)) {
      return src.match(script)
    }
    return false
  }).length
}
