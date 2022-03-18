import { isBrowser, isString, isUndefined, isRegex } from '@analytics/type-utils'
import { decodeUri } from './utils/decodeUri'
import { encodeUri } from './utils/encodeUri'
import { isReserved } from './utils/reserved'
import { encode, decode } from './utils/qss'
import { parse, stringify } from './utils/jsurl'

const HASH = '#'
const SEARCH = '?'
const ALL = /.*/
const kind = {
  '#': 'hash',
  '?': 'search',
}

/******************************************************************************************
 * General Utilities
 ******************************************************************************************/

/**
 * URL Regex pattern
 * @type {RegExp}
 */
export const URL_REGEX = /^(https?)?(?:[\:\/]*)([a-z0-9\.-]*)(?:\:(\d+))?(\/[^?#]*)?(?:\?([^#]*))?(?:#(.*))?$/i

/** 
 * @typedef {object} UrlDetails
 * @property {string} href
 * @property {string} protocol
 * @property {string} hostname
 * @property {string} port
 * @property {string} path
 * @property {string} search
 * @property {string} hash
 */

/**
 * Zero dependency backward compatible url parser
 * @param {string} url 
 * @returns {UrlDetails}
 */
export function parseUrl(url = '') {
  const match = url.match(URL_REGEX)
  return {
    href: match[0] || '',
    protocol: match[1] || '',
    hostname: match[2] || '',
    port: match[3] || '',
    pathname: match[4] || '',
    search: match[5] || '',
    hash: match[6] || '',
  }
}

/* export qss */
export {
  encode,
  decode,
  encodeUri,
  decodeUri
}

/******************************************************************************************
 * Type checkers utilities
 ******************************************************************************************/

/**
 * Check if string is URL like
 * @param {string} url 
 * @returns {boolean}
 */
export function isUrlLike(url) {
  if (!isString(url)) return false
  const match = url.match(URL_REGEX)
  return match && (match[2].indexOf('.') > -1 || isLocalHost(match[2]))
}

/**
 * Check if string is URL
 * @param {string} url 
 * @returns {boolean}
 */
export function isUrl(url = '') {
  if (!isUrlLike(url)) return false
  const parts = parseUrl(url)
  return Boolean(parts.href && parts.protocol && parts.hostname)
}

/**
 * Check if URL is internal
 * @param {string} url
 * @param {string} [currentUrl]
 * @returns {boolean}
 */
export function isInternal(url, currentUrl) {
  return !isExternal(url, currentUrl)
}

/**
 * Check if URL is external
 * @param {string} url
 * @param {string} [currentUrl]
 * @returns {boolean}
 */
export function isExternal(url, currentUrl) {
  return parseUrl(url).hostname !== getLocation(currentUrl).hostname
}

/**
 * Check if URL is localhost
 * @param {string} url
 * @returns {boolean}
 */
export function isLocalHost(url = '') {
  return url.indexOf('localhost') !== -1 || url.indexOf('127.0.0.1') !== -1
}

/******************************************************************************************
 * Getters
 ******************************************************************************************/

/**
 * Get location data of URL
 * @param {string} url
 * @returns {object}
 */
export function getLocation(url) {
  return (isUndefined(url) && isBrowser) ? window.location : parseUrl(url)
}

/**
 * Get host domain of url
 * @param  {String} url - href of page
 * @return {String} hostname of page
 *
 * @example
 *  getHost('https://subdomain.my-site.com/')
 *  > subdomain.my-site.com
 */
export function getHost(url) {
  return getLocation(url).hostname
}


/**
 * Get clean URL from a URL string
 * @param  {String} [url] - href of page, window.location.href will be used by default
 * @return {String} URL of page with no search/hash
 *
 * @example
 *  getUrl('https://subdomain.my-site.com/path-to/page/here/?param=true#hash=false')
 *  > https://subdomain.my-site.com/path-to/page/here
 */
export function getUrl(url) {
  const { protocol, hostname, pathname, port } = getLocation(url)
  return `${protocol}://${hostname}${(port) ? `:${port}` : '' }${trimTrailingSlash(pathname)}`
}

/**
 * Get base domain of url
 * @param  {String} [url] - href of page
 * @return {String} base domain of page
 *
 * @example
 *  getDomain('https://subdomain.my-site.com/')
 *  > my-site.com
 */
export function getDomain(url) {
  return getHost(url).split('.').slice(-2).join('.')
}

/**
 * Get sub domain of url
 * @param  {String} url - href of page
 * @return {String} sub domain of page
 *
 * @example
 *  getSubDomain('https://subdomain.my-site.com/')
 *  > subdomain
 */
export function getSubDomain(url) {
  const sections = getHost(url).split('.')
  if (sections.length < 2) return ''
  return sections.slice(0, -2).join('.')
}

/**
 * Trim trailing slash
 * @param {String} str - String to trim
 * @example
 *  trimTrailingSlash('google.com/')
 *  > google.com
 */
export function trimTrailingSlash(str = '') {
  return (str.charAt(str.length - 1) === '/') ? str.slice(0, -1) : str
}

/**
 * Remove TLD from domain string
 * @param  {String} domain - host name of site
 * @return {String}
 * @example
 *  trimTld('google.com')
 *  > google
 */
export function trimTld(domain) {
  const arr = domain.split('.')
  return (arr.length > 1) ? arr.slice(0, -1).join('.') : domain
}

// GET logic
function get(prefix, url, keyOrAsString, otherUrl) {
  const str = getString((url || otherUrl), prefix)
  if (keyOrAsString === true) return str
  const v = decode(str)
  return (keyOrAsString) ? v[keyOrAsString] : v
}

function getString(url, prefix) {
  const s = getLocation(url)[kind[prefix]]
  return (s.charAt(0) === prefix) ? s.substring(1) : s
}

/**
 * Strip a query parameter from a url string
 * @param  {string} url   - url with query parameters
 * @param  {string} param - parameter to strip
 * @return {string} cleaned url
 */
export function paramsClean(prefix, search, param) {
  const isPattern = isRegex(param)
  if (!isPattern && search.indexOf(param) === -1) {
    return url
  }
  // remove all matching params from URL
  const match = (isPattern) ? param.source : `\\b${param}\\b`
  const regex = new RegExp(`(\\&|\\${prefix})(${match})(=?[_A-Za-z0-9"+=.\\/\\-@%]+)?`, 'g')
  // console.log('regex', regex)
  const cleanSearch = search.replace(regex, '').replace(/^&/, prefix)
  // replace search params with clean params
  return url.replace(search, cleanSearch)
}

/**
 * Removes params from url
 * @param {'?'|'#'} prefix - Type of location data
 * @param {string|RegExp} param - param key to remove from current URL
 */
function removeParamByKey(prefix, param = ALL, url) {
  const location = getLocation(url)
  const search = prefix + getString(url, prefix)
  const isPattern = isRegex(param)
  if (!isPattern && search.indexOf(param) === -1) {
    return url
  }
  const match = (isPattern) ? param.source : `\\b${param}\\b`
  const regex = new RegExp(`(\\&|\\${prefix})(${match})(=?[_A-Za-z0-9"+=.\\/\\-@%]+)?`, 'g')
  const cleanSearch = search.replace(regex, '').replace(/^&/, prefix)
  // replace search params with clean params
  const cleanUrl = location.href.replace(search, cleanSearch)
  if (isBrowser && !url && location.href !== cleanUrl) {
    const { history } = window
    if (!history && !history.replaceState) return
    /* replace URL with history API */
    history.replaceState({}, '', cleanUrl)
  }
  return cleanUrl
}

/******************************************************************************************
 * Search Utilities
 ******************************************************************************************/

/** 
 * KeyValueObject
 * @typedef {{[key: string]: any}} KeyValueObject
 */

/** 
 * Search values
 * @typedef {KeyValueObject} SearchValues
 */

/**
 * Get search param value from URL as object. If no url, window.location.search will be used.
 * If key passed in will return specific value if found.
 * @callback GetSearch
 * @param  {string} [url] - optional url to search. Default: window.location.search
 * @param  {string|boolean} [keyOrReturnAsStringBool] - optional key to look for. Or boolean set to string
 * @return {SearchValues|string|*} url search object
 */

/** @type {GetSearch} */
export const getSearch = get.bind(null, SEARCH)

/**
 * Get search param value by key from URL
 * @callback GetSearchValue
 * @param  {string} key - Key of param to get
 * @param  {string} [url] - optional url to search. If no url, window.location.search will be used
 * @return {*} value of param
 */
/** @type {GetSearchValue} */
export const getSearchValue = get.bind(null, SEARCH, null)

/**
 * Remove search param from url in browser
 * @callback RemoveSearch
 * @param  {string|RegExp} keyOrRegexPattern - param key to remove from current URL
 * @param  {string} [url] - optional url clean. If supplied browser won't update current URL bar
 * @return {string} cleanedUrl
 */
/** @type {RemoveSearch} */
export const removeSearch = removeParamByKey.bind(null, SEARCH)


/******************************************************************************************
 * Hash Utilities
 ******************************************************************************************/

/** 
 * Hash values
 * @typedef {KeyValueObject} HashValues
 */

/**
 * Get hash param value from URL as object. If no url, window.location.hash will be used.
 * If key passed in will return specific value if found.
 * @callback GetHash
 * @param  {string} [url] - optional url to search. Default: window.location.hash
 * @param  {string|boolean} [keyOrReturnAsStringBool] - optional key to look for. Or boolean set to string
 * @return {HashValues|string|*} url hash object
 */

/** @type {GetHash} */
export const getHash = get.bind(null, HASH)

/**
 * Get specific hash value from URL. If no url, window.location.hash will be used
 * @callback GetHashValue
 * @param  {string} key - Key of param to get
 * @param  {string} [url] - optional url to search. Default: window.location.hash
 * @return {*} value of param
 */
/** @type {GetHashValue} */
export const getHashValue = get.bind(null, HASH, null)


/**
 * Remove hash param from hash url in browser
 * @callback RemoveHash
 * @param  {string|RegExp} keyOrRegexPattern - param key to remove from current URL
 * @param  {string} [url] - optional url clean. If supplied browser won't update current URL bar
 * @return {string} cleanedUrl
 */
/** @type {RemoveHash} */
export const removeHash = removeParamByKey.bind(null, HASH)

/******************************************************************************************
 * Param Utilities
 ******************************************************************************************/

/**
 * @typedef ParamDetails
 * @property {SearchValues} search - values from search
 * @property {HashValues} hash - values from hash
 */

/**
 * Get hash and search params
 * @param {string} [key] key to look for
 * @returns {ParamDetails}
 */
export const getParams = (key) => {
  return {
    search: getSearch(key),
    hash: getHash(key)
  }
}

/**
 * Remove values from hash and search
 * @param {string|RegExp} [key] key to remove
 * @returns {void}
 */
export const removeParams = (key) => {
  removeSearch(key)
  removeHash(key)
}

/******************************************************************************************
 * Compress params
 ******************************************************************************************/

/**
 * Compress search params object to string
 * @param {object} search 
 * @returns {string}
 */
export function compressParams(search) {
  search = Object.assign({}, search)
  Object.keys(search).forEach((key) => {
    const val = search[key]
    if (isUndefined(val)) {
      delete search[key]
    } else if (val && typeof val === 'object' && val !== null) {
      try {
        search[key] = stringify(val)
      } catch (err) {}
    }
  })
  const searchStr = encode(search).toString()
  return searchStr ? `?${searchStr}` : ''
}

/**
 * Decompress search params
 * @param {string} searchStr 
 * @returns {object}
 */
export function decompressParams(searchStr) {
  let query = getSearch(searchStr)
  // Try to parse any query params that might be json
  for (let key in query) {
    const value = query[key]
    if (isString(value)) {
      try {
        query[key] = parse(value)
      } catch (err) {}
    }
  }
  return query
}

/******************************************************************************************
 * Complex object parsers
 ******************************************************************************************/

/**
 * Parse url into object
 * @param {'?'|'#'} prefix - Type of location data
 * @param {string} query - URL or query string
 * @returns 
 */
function parseLogic(prefix, query) {
  let temp
  let params = Object.create(null)
  query = (isUrlLike(query) || !query) ? getString(query, prefix) : query
  const re = /([^&=]+)=?([^&]*)/g

  while (temp = re.exec(query)) {
    var k = decodeUri(temp[1])
    var v = decodeUri(temp[2])
    if (k.substring(k.length - 2) === '[]') {
      k = k.substring(0, k.length - 2);
      (params[k] || (params[k] = [])).push(v)
    } else {
      params[k] = (v === '') ? true : v
    }
  }

  for (var prop in params) {
    var arr = prop.split('[')
    if (arr.length > 1) {
      assign(params, arr.map((x) => x.replace(/[?[\]\\ ]/g, '')), params[prop])
      delete params[prop]
    }
  }
  return params
}

function assign(obj, keyPath, value) {
  var lastKeyIndex = keyPath.length - 1
  for (var i = 0; i < lastKeyIndex; ++i) {
    var key = keyPath[i]
    if (isReserved(key)) break;
    if (!(key in obj)) obj[key] = {}
    obj = obj[key]
  }
  obj[keyPath[lastKeyIndex]] = value
}

/**
 * Parse search params
 * @param  {string} [urlOrSearchString] - optional url string. If no url, window.location.search will be used
 * @return {object} url search object
 */
export const complexParseSearch = parseLogic.bind(null, SEARCH)

/**
 * Parse search params
 * @param  {string} [urlOrHashString] - optional url string. If no url, window.location.hash will be used
 * @return {object} url search object
 */
export const complexParseHash = parseLogic.bind(null, HASH)


export const complexParseParams = (key) => {
  return {
    search: complexParseSearch(key),
    hash: complexParseHash(key)
  }
}


/*
Char counts

375 using this parser
?Target=Report&Method=getStats&fields[]=Offer.name&fields[]=Advertiser.company&fields[]=Stat.clicks&fields[]=Stat.conversions&fields[]=Stat.cpa&fields[]=Stat.payout&fields[]=Stat.date&fields[]=Stat.offer_id&fields[]=Affiliate.company&groups[]=Stat.offer_id&groups[]=Stat.date&filters[Stat.affiliate_id][conditional]=EQUAL_TO&filters[Stat.affiliate_id][values]=1831&limit=9999

435 using this parser + encode
?Target=Report&Method=getStats&fields%5B%5D=Offer.name&fields%5B%5D=Advertiser.company&fields%5B%5D=Stat.clicks&fields%5B%5D=Stat.conversions&fields%5B%5D=Stat.cpa&fields%5B%5D=Stat.payout&fields%5B%5D=Stat.date&fields%5B%5D=Stat.offer_id&fields%5B%5D=Affiliate.company&groups%5B%5D=Stat.offer_id&groups%5B%5D=Stat.date&filters%5BStat.affiliate_id%5D%5Bconditional%5D=EQUAL_TO&filters%5BStat.affiliate_id%5D%5Bvalues%5D=1831&limit=9999

286 using jsurl
?Target=Report&Method=getStats&fields=~(~-Offer.name~-Advertiser.company~-Stat.clicks~-Stat.conversions~-Stat.cpa~-Stat.payout~-Stat.date~-Stat.offer_id~-Affiliate.company)&groups=~(~-Stat.offer_id~-Stat.date)&limit=9999&filters=~(Stat.affiliate_id~(conditional~-EQUAL_TO~values~-1831))

Max length of search params
https://stackoverflow.com/questions/812925/what-is-the-maximum-possible-length-of-a-query-string#:~:text=The%20default%20limit%20is%2016%2C384,This%20is%20configurable.&text=Up%20to%208%2C000%20bytes%20will%20work.

Other notes

?first=abc&a[]=123&a[]=false&b[]=str&c[]=3.5&a[]=last
https://random.url.com?Target=Report&Method=getStats&fields%5B%5D=Offer.name&fields%5B%5D=Advertiser.company&fields%5B%5D=Stat.clicks&fields%5B%5D=Stat.conversions&fields%5B%5D=Stat.cpa&fields%5B%5D=Stat.payout&fields%5B%5D=Stat.date&fields%5B%5D=Stat.offer_id&fields%5B%5D=Affiliate.company&groups%5B%5D=Stat.offer_id&groups%5B%5D=Stat.date&filters%5BStat.affiliate_id%5D%5Bconditional%5D=EQUAL_TO&filters%5BStat.affiliate_id%5D%5Bvalues%5D=1831&limit=9999
https://random.url.com?Target=Offer&Method=findAll&filters%5Bhas_goals_enabled%5D%5BTRUE%5D=1&filters%5Bstatus%5D=active&fields%5B%5D=id&fields%5B%5D=name&fields%5B%5D=default_goal_name
http://localhost:3000/?Target=Offer&Method=findAll&filters[has_goals_enabled][TRUE]=1&filters[status]=active&filters[wow]arr[]=yaz&filters[wow]arr[]=naz&fields[]=id&fields[]=name&fields[]=default_goal_name 

*/