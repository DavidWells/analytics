import { set, get, remove, globalContext } from '@analytics/global-storage-utils'
import { hasLocalStorage } from '@analytics/localstorage-utils'
import { getCookie, setCookie, removeCookie, hasCookies } from '@analytics/cookie-utils'
import parse from './utils/parse'

// Constants
export const ALL = '*'
export const LOCAL_STORAGE = 'localStorage'
export const COOKIE = 'cookie'
export const GLOBAL = 'global'

// Verify support
const hasStorage = hasLocalStorage()
const hasCookiesSupport = hasCookies()

/**
 * Get storage item from localStorage, cookie, or window
 * @param  {string} key - key of item to get
 * @param  {object|string} [options] - storage options. If string location of where to get storage
 * @param  {string} [options.storage] - Define type of storage to pull from.
 * @return {Any}  the value of key
 */
export function getItem(key, options = {}) {
  if (!key) return
  const storageType = getStorageType(options)
  // Get value from all locations
  if (storageType === ALL) return getAll(key)
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
  return get(key)
}

function getAll(key) {
  return {
    cookie: parse(getCookie(key)),
    localStorage: parse(localStorage.getItem(key)),
    global: get(key)
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
  if (!key || typeof value === 'undefined') {
    return
  }
  const data = {}
  const storageType = getStorageType(options)
  const saveValue = JSON.stringify(value)
  const setAll = storageType === ALL

  /* 1. Try localStorage */
  if (useLocal(storageType)) {
    // console.log('SET as localstorage', saveValue)
    const values = {
      current: value, 
      previous: parse(localStorage.getItem(key)) 
    }
    // Set LocalStorage item
    localStorage.setItem(key, saveValue)
    if (!setAll) {
      return { 
        location: LOCAL_STORAGE, 
        ...values 
      }
    }
    // Set object
    data[LOCAL_STORAGE] = values
  }
  /* 2. Fallback to cookie */
  if (useCookie(storageType)) {
    // console.log('SET as cookie', saveValue)
    const cookieValues = {
      current: value,
      previous: parse(getCookie(key))
    }
    // Set Cookie
    setCookie(key, saveValue)
    if (!setAll) {
      return { 
        location: COOKIE, 
        ...cookieValues 
      }
    }
    // Set object
    data[COOKIE] = cookieValues
  }
  /* 3. Fallback to window/global */
  const globalValues = {
    current: value,
    previous: get(key)
  }
  // Set global value
  set(key, value)
  if (!setAll) {
    return { 
      location: GLOBAL, 
      ...globalValues 
    }
  }
  // Set object
  data[GLOBAL] = globalValues
  return data
}

/**
 * Remove values from localStorage, cookie, or window
 * @param {string} key - key of item to set
 * @param {object|string} [options] - storage options. If string location of where to get storage
 * @param {string} [options.storage] - Define type of storage to pull from.
 */
export function removeItem(key, options = {}) {
  if (!key) return
  const storageType = getStorageType(options)
  const removeAll = storageType === ALL
  const locations = []
  if (removeAll || useLocal(storageType)) {
    /* 1. Try localStorage */
    localStorage.removeItem(key)
    locations.push(LOCAL_STORAGE)
  }
  if (removeAll || useCookie(storageType)) {
    /* 2. Fallback to cookie */
    removeCookie(key)
    locations.push(COOKIE)
  }
  /* 3. Fallback to window/global */
  if (removeAll || useGlobal(storageType)) {
    remove(key)
    locations.push(GLOBAL)
  }
  return locations
}

function getStorageType(options) {
  return (typeof options === 'string') ? options : options.storage
}

function useGlobal(storage) {
  return useType(storage, GLOBAL)
}

function useLocal(storage) {
  // If has localStorage and storage option not defined, or is set to 'localStorage' or '*'
  return hasStorage && useType(storage, LOCAL_STORAGE)
}

function useCookie(storage) {
  // If has cookies and storage option not defined, or is set to 'cookies' or '*'
  return hasCookiesSupport && useType(storage, COOKIE)
}

function useType(storage, type) {
  return (!storage || storage === type || storage === ALL)
}

export {
  getCookie,
  setCookie,
  removeCookie,
  globalContext,
  hasLocalStorage,
  hasCookies
}

export default {
  getItem,
  setItem,
  removeItem
}
