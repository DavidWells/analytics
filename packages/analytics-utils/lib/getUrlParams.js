
export default function getUrlParams(url) {
  if (typeof window === 'undefined') {
    return {}
  }
  const urlParams = {}
  const pattern = /([^&=]+)=?([^&]*)/g
  let params
  let matches
  if (url) {
    const p = url.match(/\?(.*)/) // query
    params = (p && p[1]) ? p[1].split('#')[0] : ''
  } else {
    params = window.location.search.substring(1)
  }
  if (!params) return false
  while (matches = pattern.exec(params)) { // eslint-disable-line
    if (matches[1].indexOf('[') == '-1') { // eslint-disable-line
      urlParams[decode(matches[1])] = decode(matches[2])
    } else {
      const start = matches[1].indexOf('[')
      const nested = matches[1].slice(start + 1, matches[1].indexOf(']', start))
      const key = decode(matches[1].slice(0, start))

      if (typeof urlParams[key] !== 'object') {
        urlParams[decode(key)] = {}
        urlParams[decode(key)].length = 0
      }

      if (nested) {
        urlParams[decode(key)][decode(nested)] = decode(matches[2])
      } else {
        Array.prototype.push.call(urlParams[decode(key)], decode(matches[2]))
      }
    }
  }
  return urlParams
}

function decode(s) {
  return decodeURIComponent(s).replace(/\+/g, ' ')
}
