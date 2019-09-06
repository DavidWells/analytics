import ignorePatterns from './regex'

export default function filter(values, opts = {}, type) {
  const { filter, excludeFields, debug } = opts
  let excludedInputs = ignorePatterns
  if (excludeFields) {
    excludedInputs = ignorePatterns.concat(
      excludeFields.map((thing) => {
        if (thing instanceof RegExp) return thing
        return new RegExp(`^${thing}$`)
      })
    )
  }
  return Object.keys(values).filter((key) => {
    let omission
    const omit = excludedInputs.some((pattern) => {
      omission = [key, pattern]
      return pattern.test(key.toLowerCase())
    })
    if (omit) {
      if (debug) {
        const msg = (type) ? `${type} handler for ` : ''
        console.log(`Omit ${msg}${omission[0]} field via ${omission[1]}`)
      }
      return false
    }
    if (filter && typeof filter === 'function') {
      const shouldKeep = filter(key, values[key])
      if (debug && !shouldKeep) {
        console.log(`Filtering '${key}' out field`)
      }
      return shouldKeep
    }
    return true
  }).reduce((acc, key) => {
    acc[key] = values[key]
    return acc
  }, {})
}
