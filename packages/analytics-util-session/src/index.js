// Session Utilities
import { uuid, globalContext, inBrowser } from 'analytics-utils'
import { setCookie, getCookie, removeCookie } from '@analytics/cookie-utils'

const PREFIX = '__'
const SESSION = 'session'
const PAGE = 'page'
const KEYS = ['id', 'createdAt', 'created']
const TIMEOUT = 30

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

function getDate(x) {
  const d = (x) ? new Date(x) : new Date()
  return [ d.toISOString(), d.getTime() ]
}

export function sessionData() {
  const [ iso, unix ] = getDate()
  return {
    id: uuid(),
    created: unix,
    createdAt: iso,
  }
}

function logic(kind, isSetter) {
  const data = sessionData()
  const [ get, set ] = storageMechanism[kind]
  let isNew = false
  const info = Object.fromEntries(KEYS.map((key) => {
    const k = PREFIX + kind + PREFIX + SESSION + PREFIX + key
    const currentVal = get(k)
    isNew = isSetter || !!!currentVal
    const value = (currentVal && !isSetter) ? currentVal : set(k, data[key])
    const finValue = (key !== 'created') ? value : Number(value)
    return [ key, finValue ]
  }))
  return addContext(info, isNew)
}

function addContext(obj, isNew) {
  const now = Date.now()
  obj.elapsed = now - obj.created
  if (obj.expires) obj.remaining = Math.abs(obj.expires - now)
  obj.isNew = isNew
  return obj
}

function getName() {
  return PREFIX + SESSION
}

export function getSession(minutes = TIMEOUT, persistedOnly)  {
  const cookieData = getCookie(getName())
  const data = (cookieData) ? JSON.parse(cookieData) : setSession(minutes)
  return persistedOnly ? data : addContext(data, !!!cookieData)
}

export function setSession(minutes = TIMEOUT, extend, extra)  {
  let data = extend ? getSession(minutes, true) : sessionData()
  const exp = 60 * minutes
  let timeExpire = data.created
  if (extend) {
    const [ iso, unix ] = getDate()
    data.modified = unix
    data.modifiedAt = iso
    timeExpire = unix
  }
  const [ expiresIso, expiresUnix ] = getDate(timeExpire + (exp * 1e3))
  data.expires = expiresUnix
  data.expiresAt = expiresIso
  if (extra) {
    data = Object.assign(data, extra)
  }
  setCookie(getName(), JSON.stringify(data), exp)
  return addContext(data, !extend)
}


export const extendSession = (minutes = TIMEOUT, extra) => setSession(minutes, true, extra)

export const removeSession = () => removeCookie(getName())

export const getTabSession = logic.bind(null, SESSION)
export const setTabSession = logic.bind(null, SESSION, true)

export const getPageSession = logic.bind(null, PAGE)
export const setPageSession = logic.bind(null, PAGE, true)