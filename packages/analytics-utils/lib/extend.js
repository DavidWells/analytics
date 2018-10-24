
// Allows for userland overrides of base functions
export default function extend(methodName, defaultFunction, config) {
  if (config[methodName] && typeof config[methodName] === 'function') {
    return config[methodName]
  }
  return defaultFunction
}
