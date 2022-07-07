import { set, get, remove, globalContext, GLOBAL } from '@analytics/global-storage-utils'
import { getCookie, setCookie, removeCookie, hasCookies, COOKIE } from '@analytics/cookie-utils'
import { hasLocalStorage, LOCAL_STORAGE } from '@analytics/localstorage-utils'
import { hasSessionStorage, SESSION_STORAGE } from '@analytics/session-storage-utils'
import { isUndefined, isString, ANY, ALL } from '@analytics/type-utils'
import parse from './utils/parse'

// Verify support
const hasStorage = hasLocalStorage()
const hasSessionSupport = hasSessionStorage()
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

  /* 3. Fallback to sessionStorage */
  const sessionVal = useSession(type) ? parse(sessionStorage.getItem(key)) : undefined
  if (getFirst && sessionVal) {
    return sessionVal
  }

  /* 4. Fallback to window/global. */
  const globalValue = get(key)

  return getFirst ? globalValue : {
    localStorage: localValue,
    sessionStorage: sessionVal,
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
    data[LOCAL_STORAGE] = format(LOCAL_STORAGE, value, parse(localStorage.getItem(key)))
    // Set LocalStorage item
    localStorage.setItem(key, saveValue)
    if (setFirst) {
      return data[LOCAL_STORAGE]
    }
  }

  /* 2. Fallback to cookie */
  if (useCookie(type)) {
    // console.log('SET as cookie', saveValue)
    data[COOKIE] = format(COOKIE, value, parse(getCookie(key)))
    // Set Cookie
    setCookie(key, saveValue)
    if (setFirst) {
      return data[COOKIE]
    }
  }

  /* 3. Try sessionStorage */
  if (useSession(type)) {
    // console.log('SET as localstorage', saveValue)
    data[SESSION_STORAGE] = format(SESSION_STORAGE, value, parse(sessionStorage.getItem(key)))
    // Set sessionStorage item
    sessionStorage.setItem(key, saveValue)
    if (setFirst) {
      return data[SESSION_STORAGE]
    }
  }

  /* 4. Fallback to window/global */
  data[GLOBAL] = format(GLOBAL, value, get(key))
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
  /* 1. Try localStorage */
  if (!isUndefined(values.localStorage) && useLocal(type)) {
    localStorage.removeItem(key)
    data[LOCAL_STORAGE] = values.localStorage
  }
  /* 2. Fallback to cookie */
  if (!isUndefined(values.cookie) && useCookie(type)) {
    removeCookie(key)
    data[COOKIE] = values.cookie
  }
  /* 3. Try sessionStorage */
  if (!isUndefined(values.sessionStorage) && useSession(type)) {
    sessionStorage.removeItem(key)
    data[SESSION_STORAGE] = values.sessionStorage
  }
  /* 4. Fallback to window/global */
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

function useSession(storage) {
  // If has sessionStorage and storage option not defined, or is set to 'sessionStorage' or '*'
  return hasSessionSupport && useType(storage, SESSION_STORAGE)
}

function useAll(storage) {
  return storage === ALL || storage === 'all'
}

function useType(storage, type) {
  return (storage === ANY || storage === type || useAll(storage))
}

/**
 * Format response
 * @param {string} location 
 * @param {*} current - current value
 * @param {*} previous - previous value
 * @returns 
 */
function format(location, current, previous) {
  return { location, current, previous }
}

// const TYPES = {
//   ALL,
//   ANY,
//   GLOBAL,
//   COOKIE,
//   LOCAL_STORAGE,
//   SESSION_STORAGE,   
// }

export {
  ALL,
  ANY,
  GLOBAL,
  COOKIE,
  LOCAL_STORAGE,
  SESSION_STORAGE,
  getCookie,
  setCookie,
  removeCookie,
  globalContext,
  hasSessionStorage,
  hasLocalStorage,
  hasCookies
}

export default {
  setItem,
  getItem,
  removeItem
}