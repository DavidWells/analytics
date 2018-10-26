import inBrowser from './inBrowser'
import decodeUri from './decodeUri'

export default function paramsParse(url) {
  const searchString = getSearchString(url)
  return (searchString) ? traverseParams(searchString) : {}
}

function traverseParams(searchString) {
  let matches
  const urlParams = {}
  const pattern = /([^&=]+)=?([^&]*)/g
  while (matches = pattern.exec(searchString)) { // eslint-disable-line
    if (matches[1].indexOf('[') == '-1') { // eslint-disable-line
      urlParams[decodeUri(matches[1])] = decodeUri(matches[2])
    } else {
      const start = matches[1].indexOf('[')
      const nested = matches[1].slice(start + 1, matches[1].indexOf(']', start))
      const key = decodeUri(matches[1].slice(0, start))

      if (typeof urlParams[key] !== 'object') {
        urlParams[decodeUri(key)] = {}
        urlParams[decodeUri(key)].length = 0
      }

      if (nested) {
        urlParams[decodeUri(key)][decodeUri(nested)] = decodeUri(matches[2])
      } else {
        Array.prototype.push.call(urlParams[decodeUri(key)], decodeUri(matches[2]))
      }
    }
  }
  return urlParams
}

function getSearchString(url) {
  if (url) {
    const p = url.match(/\?(.*)/)
    return (p && p[1]) ? p[1].split('#')[0] : ''
  }
  return inBrowser && window.location.search.substring(1)
}
