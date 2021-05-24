// Session Utilities
import { uuid, globalContext, inBrowser } from 'analytics-utils'
import { setCookie, getCookie } from '@analytics/cookie-utils'

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
  const info = Object.fromEntries(KEYS.map((key) => {
    const k = PREFIX + kind + key
    const currentVal = get(k)
    const value = (currentVal && !isSetter) ? currentVal : set(k, data[key])
    const finValue = (key !== 'epoch') ? value : Number(value)
    return [ key, finValue ]
  }))
  return addElasped(info)
}

function addElasped(obj) {
  obj.elapsed = Date.now() - obj.epoch
  return obj
}

export function getSession()  {
  const cookieData = getCookie(PREFIX + SESSION)
  const data = (cookieData) ? JSON.parse(cookieData) : setSession()
  return addElasped(data)
}

export function setSession()  {
  const data = sessionDetails()
  setCookie(PREFIX + SESSION, JSON.stringify(data), 60*30)
  return data
}

export const getTabSession = logic.bind(null, SESSION)
export const setTabSession = logic.bind(null, SESSION, true)

export const getPageSession = logic.bind(null, PAGE)
export const setPageSession = logic.bind(null, PAGE, true)