
export default function fitlerDisabled(methodCalls, settings = {}, options = {}) {
  return methodCalls.filter((current) => {
    const name = current.NAMESPACE
    const { integrations } = options
    // If enabled by options. Overide settings
    if (integrations && integrations[name] && integrations[name] === true) {
      return true
    }
    const disabledBySettings = settings[name] && settings[name].enabled === false
    const disabledByOptions = integrations && integrations[name] === false
    return !disabledBySettings && !disabledByOptions
  })
}
