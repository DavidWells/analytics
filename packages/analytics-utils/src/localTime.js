/**
 * Get local time as ISO string with offset at the end
 * @return {string} - "2019-08-28T22:51:47.845-07:00"
 * via https://www.simoahava.com/analytics/improve-data-collection-with-four-custom-dimensions/
 */
export function localTime() {
  const d = new Date()
  const tzo = -d.getTimezoneOffset()
  const dif = tzo >= 0 ? '+' : '-'
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds())}${dif}${pad(tzo / 60)}:${pad(tzo % 60)}`
}

function pad(num) {
  const norm = Math.abs(Math.floor(num))
  return (norm < 10 ? '0' : '') + norm
}
