import inBrowser from '../inBrowser'
import parse from './parse'
import checkLocalStorage from './hasLocalStorage'
import { getCookie, setCookie, removeCookie } from '../cookie'

const hasLocalStorage = checkLocalStorage()

export function getItem(key) {
  if (!inBrowser) {
    return false
  }
  // Try localStorage
  if (hasLocalStorage) {
    return parse(localStorage.getItem(key))
  }
  // Fallback to cookie
  try {
    return parse(getCookie(key))
  } catch (e) {
    // Fallback to window
    return window[key] || null
  }
}

export function setItem(key, value) {
  if (!inBrowser) {
    return false
  }
  const saveValue = JSON.stringify(value)
  // Try localStorage
  if (hasLocalStorage) {
    return localStorage.setItem(key, saveValue)
  }
  // Fallback to cookie
  try {
    setCookie(key, saveValue)
  } catch (e) {
    // Fallback to window
    window[key] = value
  }
  return value
}

export function removeItem(key) {
  if (!inBrowser) {
    return false
  }
  // Try localStorage
  if (hasLocalStorage) {
    return localStorage.removeItem(key)
  }
  // Fallback to Cookie
  try {
    removeCookie(key)
  } catch (e) {
    // Fallback to window
    window[key] = null
  }
  return null
}
