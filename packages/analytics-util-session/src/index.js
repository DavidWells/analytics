// Session Utilities
import { uuid } from 'analytics-utils'
import { getSessionItem, setSessionItem } from '@analytics/session-storage-utils'
import { setCookie, getCookie, removeCookie } from '@analytics/cookie-utils'
import { set, get } from '@analytics/global-storage-utils'

const PREFIX = '__'
const SESSION = 'session'
const KEY = PREFIX + SESSION
const PAGE = 'page'
const KEYS = ['id', 'createdAt', 'created']
const TIMEOUT = 30

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

const storageMechanism = {
  session: [ getSessionItem, setSessionItem ],
  page: [ get, set ]
}

function logic(kind, isSetter) {
  const [ getter, setter ] = storageMechanism[kind]
  const data = sessionData()
  let isNew = false
  let info = {}

  for (let i = 0; i < KEYS.length; i++) {
    const key = KEYS[i]
    // e.g. __page__session__createdAt, __session__session__createdAt, 
    const k = PREFIX + kind + PREFIX + SESSION + PREFIX + key
    const currentVal = getter(k)
    // Triple ! sets !!!false | !!!null | !!!undefined to true
    isNew = isSetter || !!!currentVal
    if (isSetter || !isSetter && !currentVal) setter(k, data[key])
    const value = (currentVal && !isSetter) ? currentVal : data[key]
    const finValue = (key !== 'created') ? value : Number(value)
    info[key] = finValue
  }
  return addContext(info, isNew)
}

function addContext(obj, isNew) {
  const now = Date.now()
  obj.elapsed = now - obj.created
  if (obj.expires) {
    obj.remaining = Math.max(obj.expires - now, 0)
    /* Expire session */
    obj.isExpired = obj.remaining === 0
  }
  obj.isNew = isNew
  return obj
}

export function getSession(minutes = TIMEOUT, persistedOnly) {
  const cookieData = getCookie(KEY)
  const data = (cookieData) ? JSON.parse(cookieData) : setSession(minutes)
  return persistedOnly ? data : addContext(data, !!!cookieData)
}

export function setSession(minutes = TIMEOUT, extra, extend) {
  // const { extend, minutes } = opts
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
  data.duration = (exp * 1e3)
  if (extra) {
    data = Object.assign(data, extra)
  }
  setCookie(KEY, JSON.stringify(data), exp)
  return addContext(data, !extend)
}

export const extendSession = (minutes = TIMEOUT, extra) => setSession((minutes || 1), extra, true)

export const removeSession = () => removeCookie(KEY)

export const getTabSession = logic.bind(null, SESSION)
export const setTabSession = logic.bind(null, SESSION, true)

export const getPageSession = logic.bind(null, PAGE)
export const setPageSession = logic.bind(null, PAGE, true)