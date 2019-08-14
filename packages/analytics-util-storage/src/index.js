import {
  getCookie,
  setCookie,
  removeCookie,
  hasCookieSupport
} from 'analytics-util-cookie'
import hasLocalStorage from './hasLocalStorage'
import parse from './utils/parse'
import globalContext from './utils/globalContext'

// Constants
const LOCAL_STORAGE = 'localStorage'
const COOKIE = 'cookie'

/**
 * Get storage item from localStorage, cookie, or window
 * @param  {string} key - key of item to get
 * @param  {object|string} [options] - storage options. If string location of where to get storage
 * @param  {string} [options.storage] - Define type of storage to pull from.
 * @return {Any}  the value of key
 */
export function getItem(key, options = {}) {
  if (!key) return null
  const storage = getStorageType(options)
  /* 1. Try localStorage */
  if (useLocal(storage)) {
    const value = localStorage.getItem(key)
    if (value || storage === LOCAL_STORAGE) return parse(value)
  }
  /* 2. Fallback to cookie */
  if (useCookie(storage)) {
    const value = getCookie(key)
    if (value || storage === COOKIE) return parse(value)
  }
  /* 3. Fallback to window/global. TODO verify AWS lambda & check for conflicts */
  return globalContext[key] || null
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

  const storage = getStorageType(options)
  const saveValue = JSON.stringify(value)

  /* 1. Try localStorage */
  if (useLocal(storage)) {
    // console.log('SET as localstorage', saveValue)
    const oldValue = parse(localStorage.getItem(key))
    localStorage.setItem(key, saveValue)
    return { value, oldValue, type: LOCAL_STORAGE }
  }
  /* 2. Fallback to cookie */
  if (useCookie(storage)) {
    // console.log('SET as cookie', saveValue)
    const oldValue = parse(getCookie(key))
    setCookie(key, saveValue)
    return { value, oldValue, type: COOKIE }
  }
  /* 3. Fallback to window/global */
  const oldValue = globalContext[key]
  // console.log('SET as window', value)
  globalContext[key] = value
  return { value, oldValue, type: 'window' }
}

/**
 * Remove values from localStorage, cookie, or window
 * @param {string} key - key of item to set
 * @param {object|string} [options] - storage options. If string location of where to get storage
 * @param {string} [options.storage] - Define type of storage to pull from.
 */
export function removeItem(key, options = {}) {
  if (!key) return false

  const storage = getStorageType(options)
  /* 1. Try localStorage */
  if (useLocal(storage)) {
    localStorage.removeItem(key)
    return null
  }
  /* 2. Fallback to cookie */
  if (useCookie(storage)) {
    removeCookie(key)
    return null
  }
  /* 3. Fallback to window/global */
  globalContext[key] = null
  return null
}

function getStorageType(options) {
  return (typeof options === 'string') ? options : options.storage
}

function useLocal(storage) {
  return hasLocalStorage && (!storage || storage === LOCAL_STORAGE)
}

function useCookie(storage) {
  return hasCookieSupport && (!storage || storage === COOKIE)
}

export default {
  getItem,
  setItem,
  removeItem
}
