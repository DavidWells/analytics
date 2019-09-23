import decode from './utils/decodeURIComponent'
import format from './utils/formatValue'
import { queryRegex } from './utils/regex'
/**
 * Get a given query parameter value
 * @param  {string} param - Key of parameter to find
 * @param  {string} url - url to search
 * @return {string} match
 */
export default function paramsGet(param, url) {
  var e
  const map = {}
  while (e = queryRegex.exec(url)) { // eslint-disable-line
    let KEY = decode(e[1])
    const VALUE = format(decode(e[3]))
    if (KEY.substring(KEY.length - 2) === '[]') {
      const k = KEY.substring(0, KEY.length - 2)
      if (k === param) map[param] = (map[param] || []).concat(VALUE)
    } else {
      if (KEY === param && !map[param]) map[param] = VALUE
    }
  }
  return map[param]
}
