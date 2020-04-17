import inBrowser from './inBrowser'
import inReactNative from './inReactNative'

export default function isExternalReferrer(ref) {
  if (!inBrowser || inReactNative) return false
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
