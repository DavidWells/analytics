import { isBoolean } from 'analytics-utils'

export default function fitlerDisabledPlugins(allPlugins, settings = {}, options = {}) {
  return Object.keys(allPlugins).filter((name) => {
    const { plugins } = options
    const pluginsFromOpt = plugins || {}
    if (pluginsFromOpt[name] === false) {
      return false
    }
    // If enabled by options. Overide settings
    if (pluginsFromOpt[name] === true) {
      return true
    }
    // else use state.plugin settings
    if (settings[name] && settings[name].enabled === false) {
      return false
    }
    return true
  }).map((name) => allPlugins[name])
}
