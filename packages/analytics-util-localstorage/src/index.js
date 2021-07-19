import { get, set, remove } from '@analytics/global-storage-utils'

const undef = 'undefined'
let isSupported = hasLocalStorage()
/**
 * Check if browser has access to LocalStorage
 * @returns {Boolean}
 */
function hasLocalStorage(againCheck = false) {
  if (typeof isSupported !== undef && !againCheck) {
    return isSupported
  }
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

function getItem(key) {
  return isSupported ? localStorage.getItem(key) : get(key)
}

function setItem(key, value) {
  return isSupported ? localStorage.setItem(key, value) : set(key, value)
}

function removeItem(key) {
  return isSupported ? localStorage.removeItem(key) : remove(key)
}

export {
  hasLocalStorage,
  getItem,
  setItem,
  removeItem
}