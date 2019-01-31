/**
 * Check if browser has access to LocalStorage
 *
 * @returns {Boolean}
 */
export default function hasLocalStorage() {
  try {
    if (typeof localStorage === 'undefined' || typeof JSON === 'undefined') {
      return false
    }
    // test for safari private
    localStorage.setItem('_test_', '1')
    localStorage.removeItem('_test_')
  } catch (err) {
    return false
  }
  return true
}
