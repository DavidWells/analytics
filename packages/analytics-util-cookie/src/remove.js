import setCookie from './set'
import inBrowser from './inBrowser'

export default function removeCookie(name) {
  if (!inBrowser) return false
  setCookie(name, '', -1)
}
