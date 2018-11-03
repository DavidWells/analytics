export default function parse(result) {
  let value
  try {
    value = JSON.parse(result)
    if (typeof value === 'undefined') {
      value = result
    }
    if (value === 'true') {
      value = true
    }
    if (value === 'false') {
      value = false
    }
    if (parseFloat(value) === value && typeof value !== 'object') {
      value = parseFloat(value)
    }
  } catch (e) {
    value = result
  }
  return value
}
