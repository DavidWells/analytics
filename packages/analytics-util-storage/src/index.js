import { set, get, remove, globalContext } from '@analytics/global-storage-utils'
import { getCookie, setCookie, removeCookie, hasCookies } from '@analytics/cookie-utils'
import { hasLocalStorage } from '@analytics/localstorage-utils'
import { isUndefined, isString } from '@analytics/type-utils'
import parse from './utils/parse'

// Constants
export const ALL = '*'
export const ANY = 'any'
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
export function getItem(key, options) {
  if (!key) return
  const type = getStorageType(options)
  const getFirst = !useAll(type)

  /* 1. Try localStorage */
  const localValue = useLocal(type) ? parse(localStorage.getItem(key)) : undefined
  if (getFirst && !isUndefined(localValue)) {
    return localValue
  }

  /* 2. Fallback to cookie */
  const cookieVal = useCookie(type) ? parse(getCookie(key)) : undefined
  if (getFirst && cookieVal) {
    return cookieVal
  }

  /* 3. Fallback to window/global. */
  const globalValue = get(key)

  return getFirst ? globalValue : {
    localStorage: localValue,
    cookie: cookieVal,
    global: globalValue
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
export function setItem(key, value, options) {
  if (!key || isUndefined(value)) {
    return
  }
  const data = {}
  const type = getStorageType(options)
  const saveValue = JSON.stringify(value)
  const setFirst = !useAll(type)

  /* 1. Try localStorage */
  if (useLocal(type)) {
    // console.log('SET as localstorage', saveValue)
    data[LOCAL_STORAGE] = {
      location: LOCAL_STORAGE,
      current: value, 
      previous: parse(localStorage.getItem(key))
    }
    // Set LocalStorage item
    localStorage.setItem(key, saveValue)
    if (setFirst) {
      return data[LOCAL_STORAGE]
    }
  }
  /* 2. Fallback to cookie */
  if (useCookie(type)) {
    // console.log('SET as cookie', saveValue)
    data[COOKIE] = {
      location: COOKIE,
      current: value,
      previous: parse(getCookie(key))
    }
    // Set Cookie
    setCookie(key, saveValue)
    if (setFirst) {
      return data[COOKIE]
    }
  }
  /* 3. Fallback to window/global */
  data[GLOBAL] = {
    location: GLOBAL, 
    current: value,
    previous: get(key)
  }
  // Set global value
  set(key, value)
  // Return set value(s)
  return (setFirst) ? data[GLOBAL] : data
}

/**
 * Remove values from localStorage, cookie, or window
 * @param {string} key - key of item to set
 * @param {object|string} [options] - storage options. If string location of where to get storage
 * @param {string} [options.storage] - Define type of storage to pull from.
 */
export function removeItem(key, options) {
  if (!key) return
  const type = getStorageType(options)
  const values = getItem(key, ALL)

  const data = {}
  if (!isUndefined(values.localStorage) && useLocal(type)) {
    /* 1. Try localStorage */
    localStorage.removeItem(key)
    data[LOCAL_STORAGE] = values.localStorage
  }
  if (!isUndefined(values.cookie) && useCookie(type)) {
    /* 2. Fallback to cookie */
    removeCookie(key)
    data[COOKIE] = values.cookie
  }
  /* 3. Fallback to window/global */
  if (!isUndefined(values.global) && useGlobal(type)) {
    remove(key)
    data[GLOBAL] = values.global
  }
  return data
}

function getStorageType(opts) {
  if (!opts) return ANY
  return isString(opts) ? opts : opts.storage
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

function useAll(storage) {
  return storage === ALL || storage === 'all'
}

function useType(storage, type) {
  return (storage === ANY || storage === type || useAll(storage))
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
  setItem,
  getItem,
  removeItem
}