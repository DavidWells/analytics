import getSearch from './utils/getSearch'
import decode from './utils/decodeURIComponent'
import formatValue from './utils/formatValue'
import { queryRegex } from './utils/regex'

export default function parseParams(url) {
  const searchString = getSearch(url)
  return (searchString) ? mapParams(searchString) : {}
}

function mapParams(query) {
  /* Map the key value pairs */
  const params = {}
  let e
  while (e = queryRegex.exec(query)) { // eslint-disable-line
    const KEY = decode(e[1])
    const VALUE = formatValue(decode(e[3]))
    /* Don't throw if invalid strings */
    if (KEY === null || VALUE === null) continue
    /* is Array key [1] or [] */
    if (KEY.substring(KEY.length - 2) === '[]') {
      const k = KEY.substring(0, KEY.length - 2)
      params[k] = (params[k] || []).concat(VALUE)
    } else {
      /* Prevent overriding of existing properties. Ensures that build-in
        methods like `toString` or __proto__ are not overriden by malicious querystrings. */
      if (KEY in params) continue
      /* If value has no equals sign return 'true' else 'false' */
      if (VALUE === '') {
        params[KEY] = (e[2]) ? null : true
        continue
      }
      // Set first value only
      if (!params[KEY]) params[KEY] = VALUE
    }
  }
  for (var prop in params) {
    var structure = prop.split('[')
    if (structure.length > 1) {
      var levels = []
      structure.forEach((item, i) => { // eslint-disable-line
        var key = item.replace(/[?[\]\\ ]/g, '')
        levels.push(key)
      })
      assign(params, levels, params[prop])
      delete (params[prop])
    }
  }
  return params
}

function assign(obj, keyPath, value) {
  var lastKeyIndex = keyPath.length - 1
  for (var i = 0; i < lastKeyIndex; ++i) {
    var key = keyPath[i]
    if (!(key in obj)) { obj[key] = {} }
    obj = obj[key]
  }
  obj[keyPath[lastKeyIndex]] = value
}
