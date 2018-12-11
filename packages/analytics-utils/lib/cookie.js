import hasCookies from './storage/hasCookies'

export const cookiesSupported = hasCookies()

export function setCookie(name, value, days) {
  if (!cookiesSupported) return false
  let expires = ''
  if (days) {
    const date = new Date()
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
    expires = `; expires=${date.toGMTString()}`
  }
  document.cookie = `${name}=${value}${expires}; path=/`
}

export function getCookie(name) {
  if (!cookiesSupported) return false
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

export function removeCookie(name) {
  if (!cookiesSupported) return false
  setCookie(name, '', -1)
}
