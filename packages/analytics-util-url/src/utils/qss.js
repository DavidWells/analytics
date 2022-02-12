// Modifed qss https://github.com/lukeed/qss
import { PREFIX } from '@analytics/type-utils'

const N = 'null'
const T = 'true'
const F = 'false'
const nullStr =  PREFIX + N
const trueStr = PREFIX + T
const falseStr = PREFIX + F

export function encode(obj, pfx) {
  var k, i, tmp, str = ''
  for (k in obj) {
    if ((tmp = obj[k]) !== void 0) {
      if (Array.isArray(tmp)) {
        for (i = 0; i < tmp.length; i++) {
          str && (str += '&')
          str += encodeURIComponent(k) + '=' + encodeURIComponent(format(tmp[i]))
        }
      } else {
        str && (str += '&')
        str += encodeURIComponent(k) + '=' + encodeURIComponent(format(tmp))
      }
    }
  }
  return (pfx || '') + str
}

function format(str) {
  if (str === null) return nullStr
  if (str === T) return trueStr
  if (str === F) return falseStr
  return str
}

export function decode(str) {
  var tmp, k, out = {}, arr = str.split('&')
  while ((tmp = arr.shift())) {
    tmp = tmp.split('=')
    k = tmp.shift()
    if (out[k] !== void 0) {
      out[k] = [].concat(out[k], toValue(tmp.shift()))
    } else {
      out[k] = toValue(tmp.shift())
    }
  }
  return out
}

function toValue(mix) {
  if (!mix) return ''
  var str = decodeURIComponent(mix)
  if (str === nullStr) return null
  if (str === trueStr) return T
  if (str === falseStr) return F
  if (str === T) return true
  if (str === F) return false
  return +str * 0 === 0 ? +str : str
}