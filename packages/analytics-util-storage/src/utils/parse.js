/**
 * Safe JSON parse
 * @param  {*} input - value to parse
 * @return {*} parsed input
 */
export default function parse(input) {
  let value
  try {
    value = JSON.parse(input)
    if (typeof value === 'undefined') {
      value = input
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
    value = input
  }
  return value
}
