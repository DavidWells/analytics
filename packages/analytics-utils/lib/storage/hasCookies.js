import inBrowser from '../inBrowser'
/**
 * Check if browser has access to cookies
 *
 * @returns {Boolean}
 */
export default function hasCookies() {
  try {
    if (!inBrowser) return false
    // Try to set cookie
    document.cookie = 'cookietest=1'
    const cookiesEnabled = document.cookie.indexOf('cookietest=') !== -1
    // Cleanup cookie
    document.cookie = 'cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT'
    return cookiesEnabled
  } catch (e) {
    return false
  }
}
