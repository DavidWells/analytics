export default function formatEventData(obj) {
  return Object.keys(obj).reduce(
    (acc, key) => {
      const value = obj[key]
      if (typeof value === 'number') {
        acc.metrics[key] = value
      }
      if (typeof value === 'string' || typeof value === 'boolean') {
        acc.attributes[key] = value
      }
      return acc
    },
    {
      attributes: {},
      metrics: {},
    }
  )
}
