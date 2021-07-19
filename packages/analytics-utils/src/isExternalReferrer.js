import { inBrowser } from './inBrowser'

/**
 * @param {string | null | undefined} ref
 * @returns {boolean | undefined}
 */
export function isExternalReferrer(ref) {
  if (!inBrowser) return false
  const referrer = ref || document.referrer
  if (referrer) {
    const port = window.document.location.port
    let ref = referrer.split('/')[2]
    if (port) {
      ref = ref.replace(`:${port}`, '')
    }
    return ref !== window.location.hostname
  }
  return false
}
