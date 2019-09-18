
export default function format(v) {
  if (v === '') return ''
  if (v === 'true') return true
  if (v === 'false') return false
  /* Looks like JSON. Try to parse it */
  if (v && v.match(/^(\{[^\n]+\})/)) {
    try { return JSON.parse(v) } catch (err) {}
  }
  return isNaN(v) ? v : Number(v)
}
