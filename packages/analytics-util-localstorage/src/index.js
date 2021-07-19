/**
 * Check if browser has access to LocalStorage
 *
 * @returns {Boolean}
 */
const u = 'undefined'
export function hasLocalStorage() {
  try {
    if (typeof localStorage === u || typeof JSON === u) {
      return false
    }
    // test for safari private
    localStorage.setItem('_' + u, '1')
    localStorage.removeItem('_' + u)
  } catch (err) {
    return false
  }
  return true
}