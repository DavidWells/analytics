import inBrowser from './inBrowser'

export default function isScriptLoaded(script) {
  if (!inBrowser) return true
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
