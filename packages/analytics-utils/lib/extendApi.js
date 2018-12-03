import extend from './extend'

// Allows for userland overrides of base functions
export default function extendApi(apiMethods, mergedConfig) {
  return Object.keys(apiMethods).reduce((acc, method) => {
    acc[method] = extend(method, apiMethods[method], mergedConfig)
    return acc
  }, {})
}
