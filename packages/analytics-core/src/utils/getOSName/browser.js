import { isBrowser } from '@analytics/type-utils'

export default function getBrowserOS() {
  if (!isBrowser) return false
  const os = navigator.appVersion
  // ~os bitwise operator to check if in navigator
  if (~os.indexOf('Win')) return 'Windows'
  if (~os.indexOf('Mac')) return 'MacOS'
  if (~os.indexOf('X11')) return 'UNIX'
  if (~os.indexOf('Linux')) return 'Linux'
  // default
  return 'Unknown OS'
}
