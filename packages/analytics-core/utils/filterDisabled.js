
export default function fitlerDisabled(methodCalls, options) {
  return methodCalls.filter((provider) => {
    const integrations = options && options.integrations
    const disabled = integrations && integrations[provider.NAMESPACE] === false
    return !disabled
  })
}
