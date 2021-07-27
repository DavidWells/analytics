import { get, set, remove, undef } from '@analytics/global-storage-utils'

let isSupported = hasCookies()

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
  return isSupported ? cookie(name, '', -1) : remove(name) 
}

/**
 * Check if browser has cookie support
 * @returns {boolean}
 */
function hasCookies() {
  if (typeof isSupported !== undef) {
    return isSupported
  }
  try {
    // Try to set cookie
    cookie(undef, '1')
    isSupported = document.cookie.indexOf(undef) !== -1
    // Cleanup cookie
    removeCookie(undef)
  } catch (e) {
    isSupported = false
  }
  return isSupported
}

/** 
  * Cookie setter & getter
  * @version    1.0.4
  * @date       2015-03-13
  * @stability  3 - Stable
  * @author     Lauri Rooden <lauri@rooden.ee>
  * @license    MIT License
  * Modified by David Wells
  * @param {string} name 
  * @param {*} value 
  * @param {*} ttl - Time to live in seconds
  * @param {*} path - Cookie domain
  * @param {*} domain - Cookie domain
  * @param {Boolean} secure - secure cookie
  * @returns {*} value
  * @example
    cookie('test', 'a') // set
    cookie('test', 'a', 60*60*24, '/api', '*.example.com', true) // complex set - cookie(name, value, ttl, path, domain, secure)
    cookie('test') // get
    cookie('test', '', -1) // destroy
*/
function cookie(name, value, ttl, path, domain, secure) {
  if (typeof window === undef) return
  const isSet = arguments.length > 1
  /* If cookies not supported fallback to global */
  if (!isSupported) (isSet) ? set(name, value) : get(name)
  /* Set values */
  if (isSet) {
    // eslint-disable-next-line no-return-assign
    return document.cookie = name + '=' + encodeURIComponent(value) +
      // eslint-disable-next-line operator-linebreak
        ((!ttl) ? '' :
          // Has TTL set expiration on cookie
          '; expires=' + new Date(+new Date() + (ttl * 1000)).toUTCString() +
          // If path set path
          ((!path) ? '' : '; path=' + path) +
          // If domain set domain
          ((!domain) ? '' : '; domain=' + domain) +
          // If secure set secure
          ((!secure) ? '' : '; secure'))
  }
  /* Get values */
  return decodeURIComponent((('; ' + document.cookie).split('; ' + name + '=')[1] || '').split(';')[0])
}

export {
  hasCookies,
  setCookie,
  getCookie,
  removeCookie
}
