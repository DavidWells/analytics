import { isBrowser, isBoolean, isArray, isObject, isString } from '@analytics/type-utils'

function redactObject(obj) {
  if (isString(obj)) return transform(obj, encode)
  const seen = {}
  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key]
    // Check for key and $key duplicates
    if (seen[key]) error(key)
    seen[key] = true

    if (obj.__ && obj.__[key]) {
      const key = obj.__[key]
      acc[key] = transform(value, redactObject)
      return acc
    }

    if (isRedactedKey(key)) {
      const cleanKey = key.substring(1)
      const encodedKey = encode(key)
      // Check for key and $key duplicates
      // if (seen[encodedKey]) error(encodedKey)
      if (seen[cleanKey]) error(cleanKey)
      seen[cleanKey] = true
      if (!acc._) {
        acc._ = []
      }
      acc._ = acc._.concat(encodedKey)
      // acc[key] = transform(value, redactObject)
      acc[encodedKey] = transform(value, redactObject)
      return acc
    }
    acc[key] = (isObject(value)) ? transform(value, redactObject) : value
    return acc
  }, {})
}

function error(key) {
  throw new Error(`Redact error: Dupe keys '${key}' & '$${key}'`)
}

function restoreObject(obj, clean) {
  if (isString(obj)) {
    return transform(obj, decode)
  }
  const fin = Object.keys(obj).reduce((acc, key) => {
    if (key === '_') {
      return acc
    }
    // console.log('key', key)
    // console.log('obj', obj)
    const value = obj[key]
    if (obj._ && obj._.includes(key)) {
    // if (obj.__ && obj.__.hasOwnProperty(key)) {
      acc[decode(key)] = transform(value, restoreObject)
      return acc
    }
    acc[key] = (isObject(value)) ? transform(value, restoreObject) : value
    return acc
  }, {})

  return clean ? cleanObject(fin) : fin
}

function cleanObject(obj) {
  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key]
    if (isRedactedKey(key)) {
      const cleanKey = key.substring(1)
      acc[cleanKey] = transform(value, (x) => x, cleanObject)
      return acc
    }
    acc[key] = (isObject(value)) ? transform(value, (x) => x, cleanObject) : value
    return acc
  }, {})
}

function isRedactedKey(key) {
  return key.match(/^\$/)
}

function transform(value, fn, fnOnObject) {
  if (isBoolean(value)) {
    return value
  }
  if (isArray(value)) {
    return value.map((v) => transform(v, fn, fnOnObject))
  }
  if (fnOnObject && isObject(value)) {
    return fnOnObject(value)
  }
  return fn(value)
}


const encode = (str) => isBrowser ? window.btoa(str) : Buffer.from(str, 'utf8').toString('base64')
const decode = (str) => isBrowser ? window.atob(str) : Buffer.from(str, 'base64').toString('utf8')

function safeEncode(str) {
  try {
    return encode(str)
  } catch (err) {}
  return str
}

function safeDecode(str) {
  try {
    return decode(str)
  } catch (err) {}
  return str
}

module.exports = {
  safeEncode,
  safeDecode,
  encode,
  decode,
  redactObject,
  restoreObject,
  cleanObject
}
