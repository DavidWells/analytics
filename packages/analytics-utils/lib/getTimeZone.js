
export default function getTimeZone() {
  if (
    typeof Intl === 'undefined' ||
    typeof Intl.DateTimeFormat !== 'function' ||
    typeof Intl.DateTimeFormat().resolvedOptions !== 'function'
  ) {
    return null
  }
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}
