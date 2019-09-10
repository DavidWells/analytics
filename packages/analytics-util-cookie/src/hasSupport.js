import cookie from './cookie'

export default function hasCookieSupport() {
  try {
    const key = '___c'
    // Try to set cookie
    cookie(key, '1')
    // Cleanup cookie
    cookie(key, '', -1)
    return document.cookie.indexOf(key) !== -1
  } catch (e) {
    return false
  }
}
