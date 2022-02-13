import { isString, isBrowser } from '@analytics/type-utils'
import { encode, decode } from './utils/qss'
import { parse, stringify } from './utils/jsurl'
import { decodeUri } from './utils/decodeUri'
import { encodeUri } from './utils/encodeUri'
import { isReserved } from './utils/reserved'

const URL_REGEX = /^(https?)?(?:[\:\/]*)([a-z0-9\.-]*)(?:\:(\d+))?(\/[^?#]*)?(?:\?([^#]*))?(?:#(.*))?$/i

/**
 * Check if string is URL like
 * @param {string} url 
 * @returns {boolean}
 */
export function isUrlLike(url = '') {
  return isString(url) && Boolean(url.match(URL_REGEX)[0])
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
export function isInternal(url = '', currentUrl) {
  return parseUrl(url).hostname === getLocation(currentUrl).hostname
}

/**
 * Check if URL is external
 * @param {string} url
 * @param {string} [currentUrl]
 * @returns {boolean}
 */
export function isExternal(url, currentUrl) {
  return !isInternal(url, currentUrl)
}

export function getLocation(url) {
  return (!url && isBrowser) ? window.location : parseUrl(url)
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
 * Get base domain of url
 * @param  {String} url - href of page
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

/**
 * Get search param values from URL
 * @param  {string} [url] - optional url string. If no url, window.location.search will be used
 * @return {*} url search object
 */
export const getSearch = get.bind(null, '?', true)

/**
 * Get search param value from URL
 * @param  {string} key - Key of param to get
 * @param  {string} [url] - optional url to search. If no url, window.location.search will be used
 * @return {*} value of param
 */
export const getSearchValue = get.bind(null, '?', true, null)

/**
 * Get hash string from given url
 * @param  {string} [url] - optional url string. If no url, window.location.hash will be used
 * @return {*} url hash object
 */
export const getHash = get.bind(null, '#', true)

const kind = {
  '?': ['search', getSearch ],
  '#': ['hash', getHash ]
}

/**
 * Trim leading ? or #
 * @param {String} s 
 * @returns trimmed string
 */
function trim(s) {
  return (s.charAt(0) === '#' || s.charAt(0) === '?') ? s.substring(1) : s
}

function get(prefix, parse, url, key, otherUrl) {
  const str = trim(getLocation(url || otherUrl)[kind[prefix][0]])
  if (!parse) return str
  const v = decode(str)
  return (key) ? v[key] : v
}

/**
 * Get hash param value from URL
 * @param  {string} key - Key of param to get
 * @param  {string} [url] - optional url to search. If no url, window.location.hash will be used
 * @return {*} value of param
 */
export const getHashValue = get.bind(null, '#', true, null)

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
    path: match[4] || '',
    search: match[5] || '',
    hash: match[6] || '',
  }
}

/**
 * Parse URL query params
 * @param {*} query 
 * @returns 
 */

/**
 * Parse url into object
 * @param {'?'|'#'} prefix - Type of 
 * @param {string} query - URL or query string
 * @returns 
 */
function parseLogic(prefix, query) {
  let temp
  let params = Object.create(null)
  query = trim(getLocation(query)[kind[prefix][0]])
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
export const parseSearch = parseLogic.bind(null, '?')

/**
 * Parse search params
 * @param  {string} [urlOrHashString] - optional url string. If no url, window.location.hash will be used
 * @return {object} url search object
 */
export const parseHash = parseLogic.bind(null, '#')

export const parseParams = (x) => {
  return {
    search: parseSearch(x),
    hash: parseHash(x)
  }
}

// name compress
export function compressParams(search) {
  search = Object.assign({}, search)
  Object.keys(search).forEach((key) => {
    const val = search[key]
    if (typeof val === 'undefined' || val === undefined) {
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
// name decompress
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

/* export qss */
export {
  encode,
  decode,
  encodeUri,
  decodeUri
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