import { isBoolean } from '@analytics/type-utils'

export default function fitlerDisabledPlugins(allPlugins, settings = {}, options = {}) {
  return Object.keys(allPlugins).filter((name) => {
    const plugin = allPlugins[name]
    const fromCallOptions = options.plugins || {}
    // If enabled/disabled by options. Override settings
    if (isBoolean(fromCallOptions[name])) {
      return fromCallOptions[name]
    }
    // If all: false disable everything unless explicitly enabled or alwaysEnabled
    if (fromCallOptions.all === false) {
      return plugin && plugin.alwaysEnabled === true
    }
    // else use state.plugin settings
    if (settings[name] && settings[name].enabled === false) {
      return false
    }
    return true
  }).map((name) => allPlugins[name])
}
