const undef = 'undefined'
let isSupported
/**
 * Check if browser has access to LocalStorage
 * @returns {Boolean}
 */
export function hasLocalStorage() {
  if (typeof isSupported !== undef) return isSupported
  isSupported = true
  try {
    if (typeof localStorage === undef || typeof JSON === undef) {
      isSupported = false
    }
    // test for safari private
    localStorage.setItem('_' + undef, '1')
    localStorage.removeItem('_' + undef)
  } catch (err) {
    isSupported = false
  }
  return isSupported
}