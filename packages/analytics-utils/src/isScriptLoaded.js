import inBrowser from './inBrowser'

/**
 * Check if a script is loaded
 * @param  {String|RegExp} script - Script src as string or regex
 * @return {Boolean} is script loaded
 */
export default function isScriptLoaded(script) {
  if (!inBrowser || inReactNative) return true
  const scripts = document.getElementsByTagName('script')
  return !!Object.keys(scripts).filter((key) => {
    const { src } = scripts[key]
    if (typeof script === 'string') {
      return src.indexOf(script) !== -1
    } else if (script instanceof RegExp) {
      return src.match(script)
    }
    return false
  }).length
}
