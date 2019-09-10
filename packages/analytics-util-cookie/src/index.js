import cookie from './cookie'
import hasCookieSupport from './hasSupport'

/**
 * Get a cookie value
 * @param  {string} name - key of cookie
 * @return {string} value of cookie
 */
const getCookie = cookie

/**
 * Set a cookie value
 * @param {string} name  - key of cookie
 * @param {string} value - value of cookie
 * @param {string} days  - days to keep cookie
 */
const setCookie = cookie

/**
 * Remove a cookie value.
 * @param {string} name  - key of cookie
 */
function removeCookie(name) {
  return cookie(name, '', -1)
}

export {
  hasCookieSupport,
  setCookie,
  getCookie,
  removeCookie
}
