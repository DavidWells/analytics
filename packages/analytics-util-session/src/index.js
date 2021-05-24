// Session Utilities
import { uuid, globalContext, inBrowser } from 'analytics-utils'
import { setCookie, getCookie, removeCookie } from '@analytics/cookie-utils'

const PREFIX = '__'
const SESSION = 'session'
const PAGE = 'page'
const KEYS = ['id', 'date', 'epoch']

function isSessionSupported() {
  if (inBrowser) {
    try {
      sessionStorage.setItem(PREFIX, PREFIX)
      sessionStorage.removeItem(PREFIX)
      return true
    } catch (e) {}
  }
  return false
}

const hasSessionStorage = isSessionSupported()

function getSessionItem(key, defaultValue) {
  let value = (hasSessionStorage) ? sessionStorage.getItem(key) : getGlobal(key)
  if (value == null && defaultValue) {
    value = setSessionItem(key, defaultValue)
  }
  return value
}

function setSessionItem(key, value) {
	if (hasSessionStorage) {
    sessionStorage.setItem(key, value)
    return value
	}
  return setGlobal(key, value)
}

function setGlobal(key, val) {
  globalContext[key] = val
  return val
}

function getGlobal(key) {
  return globalContext[key]
}

const storageMechanism = {
  session: [ getSessionItem, setSessionItem ],
  page: [ getGlobal, setGlobal ]
}

export function sessionDetails() {
  const d = new Date()
  return {
    id: uuid(),
    date: d.toISOString(),
    epoch: d.getTime(),
  }
}

function logic(kind, isSetter) {
  const data = sessionDetails()
  const [ get, set ] = storageMechanism[kind]
  let isNew = false
  const info = Object.fromEntries(KEYS.map((key) => {
    const k = PREFIX + kind + key
    const currentVal = get(k)
    isNew = isSetter || !!!currentVal
    const value = (currentVal && !isSetter) ? currentVal : set(k, data[key])
    const finValue = (key !== 'epoch') ? value : Number(value)
    return [ key, finValue ]
  }))
  return addContext(info, isNew)
}

function addContext(obj, isNew) {
  obj.elapsed = Date.now() - obj.epoch
  obj.isNew = isNew
  return obj
}

function getName() {
  return PREFIX + SESSION
}

export function getSession()  {
  const cookieData = getCookie(getName())
  const data = (cookieData) ? JSON.parse(cookieData) : setSession()
  return addContext(data, !!!cookieData)
}

export function setSession(minutes = 30)  {
  const data = sessionDetails()
  setCookie(getName(), JSON.stringify(data), 60 * minutes)
  return addContext(data, true)
}

export const removeSession = () => removeCookie(getName())

export const getTabSession = logic.bind(null, SESSION)
export const setTabSession = logic.bind(null, SESSION, true)

export const getPageSession = logic.bind(null, PAGE)
export const setPageSession = logic.bind(null, PAGE, true)