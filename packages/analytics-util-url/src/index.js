import { isString } from '@analytics/type-utils'
import { encode, decode } from './utils/qss'
import { parse, stringify } from './utils/jsurl'

const URL_REGEX = /^(https?)?(?:[\:\/]*)([a-z0-9\.-]*)(?:\:(\d+))?(\/[^?#]*)?(?:\?([^#]*))?(?:#(.*))?$/i

/* Zero dependency backward compatible url parser */
export function parseUrl(url = '') {
  const match = url.match(URL_REGEX)
  return {
    protocol: match[1] || '',
    hostname: match[2] || '',
    port: match[3] || '',
    path: match[4] || '',
    search: match[5] || '',
    hash: match[6] || '',
  }
}

/**
 * Check if string is URL
 * @param {string} url 
 * @returns 
 */
export function isUrl(url = '') {
  return Boolean(url.match(URL_REGEX))
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
  return parseUrl(url).hostname
}

/**
 * Get host domain of url
 * @param  {String} url - href of page
 * @return {String} base hostname of page
 *
 * @example
 *  getDomain('https://subdomain.my-site.com/')
 *  > my-site.com
 */
export function getDomain(url = '') {
  const host = getHost(url)
  return host.split('.').slice(-2).join('.')
}

/**
 * Get host domain of url
 * @param  {String} url - href of page
 * @return {String} sub domain of page
 *
 * @example
 *  getSubDomain('https://subdomain.my-site.com/')
 *  > subdomain
 */
export function getSubDomain(url = '') {
  const host = getHost(url)
  const sections = host.split('.')
  if (sections.length < 2) return
  return sections.slice(0, -2).join('.')
}

/**
 * Remove TLD from domain string
 * @param  {String} baseDomain - host name of site
 * @return {String}
 * @example
 *  trimTld('google.com')
 *  > google
 */
export function trimTld(baseDomain) {
  const arr = baseDomain.split('.')
  return (arr.length > 1) ? arr.slice(0, -1).join('.') : baseDomain
}


function trimSearch(s) {
  return s.charAt(0) === '?' ? s.substring(1) : s
}

/**
 * Get search string from given url
 * @param  {string} [url] - optional url string. If no url, window.location.search will be used
 * @return {string} url search string
 */
function getSearch(url = '') {
  if (!url && isBrowser) return window.location.search.substring(1)
  return trimSearch(isUrl(url) ? parseUrl(url).search : url)
}

/**
 * Decode URI string
 *
 * @param {String} s string to decode
 * @returns {String} decoded string
 * @example
 * decode("Bought%20keyword)
 * => "Bought keyword"
 */
export function decodeUri(s) {
  try {
    return decodeURIComponent(s.replace(/\+/g, ' '))
  } catch (e) {
    return null
  }
}

export function getParams(query) {
  let temp
  let params = Object.create(null)
  query = getSearch(query)
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
    if (key === '__proto__' || key === 'constructor') break;
    if (!(key in obj)) { 
      obj[key] = {} 
    }
    obj = obj[key]
  }
  obj[keyPath[lastKeyIndex]] = value
}

export function stringifySearch(search) {
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

export function parseSearch(searchStr) {
  let query = decode(getSearch(searchStr))
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