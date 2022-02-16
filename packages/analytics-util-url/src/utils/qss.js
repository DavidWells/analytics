// Modified qss https://github.com/lukeed/qss
import { decodeUri } from './decodeUri'
import { encodeUri } from './encodeUri'
import { isReserved } from './reserved'

const P = '_'
const N = 'null'
const T = 'true'
const F = 'false'
const nullStr =  P + N
const trueStr = P + T
const falseStr = P + F

/**
 * Returns the formatted querystring.
 * @param {KeyValueObject} obj - The object that contains all query parameter keys & their values.
 * @returns {String}
 */
export function encode(obj) {
  var k, i, tmp, str = ''
  for (k in obj) {
    if ((tmp = obj[k]) !== void 0) {
      if (Array.isArray(tmp)) {
        for (i = 0; i < tmp.length; i++) {
          str && (str += '&')
          str += format(k, tmp[i])
        }
      } else {
        str && (str += '&')
        str += format(k, tmp)
      }
    }
  }
  return str
}

function format(k, v) {
  if (v === null) v = nullStr
  if (v === T) v = trueStr
  if (v === F) v = falseStr
  return encodeUri(k) + '=' + encodeUri(v)
}

/**
 * Returns an Object with decoded keys and values.
 * @param {String} str - The query string, without its leading ? character.
 * @returns {KeyValueObject}
 */
export function decode(str = '') {
  var tmp, k, out = {}, arr = str.split('&')
  while ((tmp = arr.shift())) {
    tmp = tmp.split('=')
    k = tmp.shift()
    if (isReserved(k)) break;
    if (out[k] !== void 0) {
      out[k] = [].concat(out[k], toValue(tmp.shift()))
    } else {
      out[k] = toValue(tmp.shift())
    }
  }
  return out
}

function toValue(v) {
  if (!v) return ''
  var str = decodeUri(v)
  if (str === nullStr) return null
  if (str === trueStr) return T
  if (str === falseStr) return F
  if (str === T) return true
  if (str === F) return false
  return +str * 0 === 0 ? +str : str
}