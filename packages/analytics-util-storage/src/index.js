import { getCookie, setCookie, removeCookie, hasCookieSupport } from '@analytics/cookie-utils'
import hasLocalStorageSupport from './hasLocalStorage'
import parse from './utils/parse'
import globalContext from './utils/globalContext'

// Constants
const LOCAL_STORAGE = 'localStorage'
const COOKIE = 'cookie'
const GLOBAL = 'global'

// Verify support
const hasStorage = hasLocalStorageSupport()
const hasCookies = hasCookieSupport()

/**
 * Get storage item from localStorage, cookie, or window
 * @param  {string} key - key of item to get
 * @param  {object|string} [options] - storage options. If string location of where to get storage
 * @param  {string} [options.storage] - Define type of storage to pull from.
 * @return {Any}  the value of key
 */
export function getItem(key, options = {}) {
  if (!key) return null
  const storageType = getStorageType(options)
  // Get value from all locations
  if (storageType === 'all') return getAll(key)
  /* 1. Try localStorage */
  if (useLocal(storageType)) {
    const value = localStorage.getItem(key)
    if (value || storageType === LOCAL_STORAGE) return parse(value)
  }
  /* 2. Fallback to cookie */
  if (useCookie(storageType)) {
    const value = getCookie(key)
    if (value || storageType === COOKIE) return parse(value)
  }
  /* 3. Fallback to window/global. */
  return globalContext[key] || null
}

function getAll(key) {
  return {
    cookie: parse(getCookie(key)),
    localStorage: parse(localStorage.getItem(key)),
    global: globalContext[key] || null
  }
}

/**
 * Store values in localStorage, cookie, or window
 * @param {string} key - key of item to set
 * @param {*} value - value of item to set
 * @param {object|string} [options] - storage options. If string location of where to get storage
 * @param {string} [options.storage] - Define type of storage to pull from.
 * @returns {object} returns old value, new values, & location of storage
 */
export function setItem(key, value, options = {}) {
  if (!key || !value) return false
  const storageType = getStorageType(options)
  const saveValue = JSON.stringify(value)
  /* 1. Try localStorage */
  if (useLocal(storageType)) {
    // console.log('SET as localstorage', saveValue)
    const oldValue = parse(localStorage.getItem(key))
    localStorage.setItem(key, saveValue)
    return { value, oldValue, location: LOCAL_STORAGE }
  }
  /* 2. Fallback to cookie */
  if (useCookie(storageType)) {
    // console.log('SET as cookie', saveValue)
    const oldValue = parse(getCookie(key))
    setCookie(key, saveValue)
    return { value, oldValue, location: COOKIE }
  }
  /* 3. Fallback to window/global */
  const oldValue = globalContext[key]
  globalContext[key] = value
  return { value, oldValue, location: GLOBAL }
}

/**
 * Remove values from localStorage, cookie, or window
 * @param {string} key - key of item to set
 * @param {object|string} [options] - storage options. If string location of where to get storage
 * @param {string} [options.storage] - Define type of storage to pull from.
 */
export function removeItem(key, options = {}) {
  if (!key) return false
  const storageType = getStorageType(options)
  if (useLocal(storageType)) {
    /* 1. Try localStorage */
    localStorage.removeItem(key)
    return LOCAL_STORAGE
  } else if (useCookie(storageType)) {
    /* 2. Fallback to cookie */
    removeCookie(key)
    return COOKIE
  }
  /* 3. Fallback to window/global */
  globalContext[key] = null
  return GLOBAL
}

function getStorageType(options) {
  return (typeof options === 'string') ? options : options.storage
}

function useLocal(storage) {
  return hasStorage && (!storage || storage === LOCAL_STORAGE)
}

function useCookie(storage) {
  return hasCookies && (!storage || storage === COOKIE)
}

export {
  getCookie,
  setCookie,
  removeCookie,
  hasLocalStorageSupport,
  hasCookieSupport
}

export default {
  getItem,
  setItem,
  removeItem
}
