/**
 * Check if browser has access to LocalStorage
 *
 * @returns {Boolean}
 */
function hasLocalStorage() {
  if (!process.browser) return false
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

export default process.browser ? hasLocalStorage() : false
