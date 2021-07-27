import { isBoolean } from '@analytics/type-utils'

export default function fitlerDisabledPlugins(allPlugins, settings = {}, options = {}) {
  return Object.keys(allPlugins).filter((name) => {
    const fromCallOptions = options.plugins || {}
    // If enabled/disabled by options. Override settings
    if (isBoolean(fromCallOptions[name])) {
      return fromCallOptions[name]
    }
    // If all: false disable everything unless true explicitly set
    if (fromCallOptions.all === false) {
      return false
    }
    // else use state.plugin settings
    if (settings[name] && settings[name].enabled === false) {
      return false
    }
    return true
  }).map((name) => allPlugins[name])
}
