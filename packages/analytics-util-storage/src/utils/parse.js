import { isObject } from '@analytics/type-utils'
/**
 * Safe JSON parse
 * @param  {*} input - value to parse
 * @return {*} parsed input
 */
export default function parse(input) {
  let value = input
  try {
    value = JSON.parse(input)
    if (value === 'true') return true
    if (value === 'false') return false
    if (isObject(value)) return value
    if (parseFloat(value) === value) {
      value = parseFloat(value)
    }
  } catch (e) { }
  if (value === null || value === "") {
    return
  }
  return value
}
