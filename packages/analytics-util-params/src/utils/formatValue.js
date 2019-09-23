
/**
 * Format value
 * @param  {any} value - original value to format
 * @return {any} formatted value
 */
export default function format(value) {
  if (value === '') return ''
  if (value === 'true') return true
  if (value === 'false') return false
  /* Looks like JSON. Try to parse it */
  if (value && value.match(/^(\{[^\n]+\})/)) {
    try { return JSON.parse(value) } catch (err) {}
  }
  return isNaN(value) ? value : Number(value)
}
