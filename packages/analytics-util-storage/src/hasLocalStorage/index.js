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
    localStorage.setItem('_t_', '1')
    localStorage.removeItem('_t_')
  } catch (err) {
    return false
  }
  return true
}
