
export default function isExternalReferrer() {
  if (typeof document !== 'undefined' && document.referrer) {
    const port = window.document.location.port
    let ref = document.referrer.split('/')[2]
    if (port) {
      ref = ref.replace(`:${port}`, '')
    }
    return ref !== window.location.hostname
  }
  return false
}
