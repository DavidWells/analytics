import cookie from './cookie'

export default function hasCookieSupport() {
  try {
    const key = '_c_'
    // Try to set cookie
    cookie(key, '1')
    const valueSet = document.cookie.indexOf(key) !== -1
    // Cleanup cookie
    cookie(key, '', -1)
    return valueSet
  } catch (e) {
    return false
  }
}
