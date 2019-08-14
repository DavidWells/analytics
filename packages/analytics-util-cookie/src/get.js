import noOp from './noOp'

/**
 * Get a cookie value
 * @param  {string} name - key of cookie
 * @return {string} value of cookie
 */
function getCookie(name) {
  const find = `${name}=`
  const allCookies = document.cookie.split(';')
  for (let i = 0; i < allCookies.length; i++) {
    let cookie = allCookies[i]
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length)
    }
    if (cookie.indexOf(find) === 0) {
      return cookie.substring(find.length, cookie.length)
    }
  }
  return null
}

export default process.browser ? getCookie : noOp
