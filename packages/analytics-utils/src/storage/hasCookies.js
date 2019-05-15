import inBrowser from '../inBrowser'
/**
 * Check if browser has access to cookies
 *
 * @returns {Boolean}
 */
export default function hasCookies() {
  try {
    if (!inBrowser) return false
    const key = 'cookietest='
    // Try to set cookie
    document.cookie = `${key}1`
    const cookiesEnabled = document.cookie.indexOf(key) !== -1
    // Cleanup cookie
    document.cookie = `${key}1; expires=Thu, 01-Jan-1970 00:00:01 GMT`
    return cookiesEnabled
  } catch (e) {
    return false
  }
}
