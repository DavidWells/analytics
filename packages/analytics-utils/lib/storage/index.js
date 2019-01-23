import inBrowser from '../inBrowser'
import parse from './parse'
import checkLocalStorage from './hasLocalStorage'
import { getCookie, setCookie, removeCookie, cookiesSupported } from '../cookie'

const hasLocalStorage = checkLocalStorage()

/**
 * Get storage item from localStorage, cookie, or window
 * @param  {[type]} key - key of item to get
 * @param  {Object} opts - (optional)
 * @param  {String} opts.storage - Define type of storage to pull from.
 * @return {Any}  the value of key
 */
export function getItem(key, opts) {
  if (!inBrowser || !key) return false
  const options = opts || {}
  const { storage } = options
  // Try localStorage
  if (hasLocalStorage && (!storage || storage === 'localStorage')) {
    const value = localStorage.getItem(key)
    if (value || storage === 'localStorage') return parse(value)
  }
  // Fallback to cookie
  if (cookiesSupported && (!storage || storage === 'cookie')) {
    const value = getCookie(key)
    if (value || storage === 'cookie') return parse(value)
  }
  // Fallback to window
  return window[key] || null
}

/**
 * Store values in localStorage, cookie, or window
 * @param {String} key - key of item to set
 * @param {Any} value - value of item to set
 * @param {Object} opts - (optional)
 * @param {String} opts.storage - Define type of storage to set to.
 */
export function setItem(key, value, opts) {
  if (!inBrowser || !key || !value) return false
  const saveValue = JSON.stringify(value)
  const options = opts || {}
  const { storage } = options
  // 1. Try localStorage
  if (hasLocalStorage && (!storage || storage === 'localStorage')) {
    // console.log('SET as localstorage', saveValue)
    const oldValue = parse(localStorage.getItem(key))
    localStorage.setItem(key, saveValue)
    return { value, oldValue, type: 'localStorage' }
  }
  // 2. Fallback to cookie
  if (cookiesSupported && (!storage || storage === 'cookie')) {
    // console.log('SET as cookie', saveValue)
    const oldValue = parse(getCookie(key))
    setCookie(key, saveValue)
    return { value, oldValue, type: 'cookie' }
  }
  // 3. Fallback to window
  const oldValue = window[key]
  // console.log('SET as window', value)
  window[key] = value
  return { value, oldValue, type: 'window' }
}

/**
 * Remove values from localStorage, cookie, or window
 * @param {String} key - key of item to set
 * @param {Object} opts - (optional)
 * @param {String} opts.storage - Define type of storage to set to.
 */
export function removeItem(key, opts) {
  if (!inBrowser || !key) return false
  const options = opts || {}
  const { storage } = options
  // 1. Try localStorage
  if (hasLocalStorage && (!storage || storage === 'localStorage')) {
    localStorage.removeItem(key)
    return null
  }
  // 2. Fallback to cookie
  if (cookiesSupported && (!storage || storage === 'cookie')) {
    removeCookie(key)
    return null
  }
  // 3. Fallback to window
  window[key] = null
  return null
}

//*
export default {
  getItem,
  setItem,
  removeItem
}
/**/
