/**
 * Check if browser has access to LocalStorage
 *
 * @returns {Boolean}
 */
export default function hasLocalStorage() {
  if (!process.browser) return false
  try {
    if (typeof localStorage === 'undefined' || typeof JSON === 'undefined') {
      return false
    }
    // test for safari private
    localStorage.setItem('__test', '1')
    localStorage.removeItem('__test')
  } catch (err) {
    return false
  }
  return true
}
