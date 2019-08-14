import noOp from './noOp'

/**
 * Set a cookie value
 * @param {string} name  - key of cookie
 * @param {string} value - value of cookie
 * @param {string} days  - days to keep cookie
 */
function setCookie(name, value, days) {
  let expires = ''
  if (days) {
    const date = new Date()
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
    expires = `; expires=${date.toGMTString()}`
  }
  document.cookie = `${name}=${value}${expires}; path=/`
}

export default process.browser ? setCookie : noOp
