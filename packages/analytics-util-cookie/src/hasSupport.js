
function hasCookieSupport() {
  try {
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

export default process.browser ? hasCookieSupport() : false
