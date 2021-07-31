import { isBrowser } from '@analytics/type-utils'
import { paramsParse } from './paramsParse'
import { isExternalReferrer } from './isExternalReferrer'
import { trimTld, getDomainBase } from './url'

const googleKey = 'google'

/**
 * @typedef {{
 *  campaign: string,
 *  referrer?: string,
 * } & DomainObject & Object.<string, any>} ReferrerObject
 */

/**
 * Checks a given url and parses referrer data
 * @param  {String} [referrer] - (optional) referring URL
 * @param  {String} [currentUrl] - (optional) the current url
 * @return {ReferrerObject}     [description]
 */
export function parseReferrer(referrer, currentUrl) {
  if (!isBrowser) return false
  // default referral data
  let refData = {
    'source': '(direct)',
    'medium': '(none)',
    'campaign': '(not set)'
  }
  // Add raw ref url if external
  if (referrer && isExternalReferrer(referrer)) {
    refData.referrer = referrer
  }

  const domainInfo = parseDomain(referrer)
  // Read referrer URI and infer source
  if (domainInfo && Object.keys(domainInfo).length) {
    refData = Object.assign({}, refData, domainInfo)
  }

  // Read URI params and use set utm params
  const params = paramsParse(currentUrl)
  const paramKeys = Object.keys(params)
  if (!paramKeys.length) {
    return refData
  }

  // set campaign params off GA matches
  const gaParams = paramKeys.reduce((acc, key) => {
    // match utm params & dclid (display) & gclid (cpc)
    if (key.match(/^utm_/)) {
      acc[`${key.replace(/^utm_/, '')}`] = params[key]
    }
    // https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters
    // dclid - cpc Cost-Per-Thousand Impressions
    // gclid - cpc Cost per Click
    if (key.match(/^(d|g)clid/)) {
      acc['source'] = googleKey
      acc['medium'] = (params.gclid) ? 'cpc' : 'cpm'
      acc[key] = params[key]
    }
    return acc
  }, {})

  return Object.assign({}, refData, gaParams)
}

/**
 * @typedef {{
 *  source: string,
 *  medium: string,
 *  term?: string
 * }} DomainObject
 */

/**
 * Client side domain parser for determining marketing data.
 * @param  {String} referrer - ref url
 * @return {DomainObject | boolean}
 */
function parseDomain(referrer) {
  if (!referrer || !isBrowser) return false

  let referringDomain = getDomainBase(referrer)
  const a = document.createElement('a')
  a.href = referrer

  // Shim for the billion google search engines
  if (a.hostname.indexOf(googleKey) > -1) {
    referringDomain = googleKey
  }

  // If is search engine
  if (searchEngines[referringDomain]) {
    const searchEngine = searchEngines[referringDomain]
    const queryParam = (typeof searchEngine === 'string') ? searchEngine : searchEngine.p
    const termRegex = new RegExp(queryParam + '=.*?([^&#]*|$)', 'gi')
    const term = a.search.match(termRegex)

    return {
      source: searchEngine.n || trimTld(referringDomain),
      medium: 'organic',
      term: (term ? term[0].split('=')[1] : '') || '(not provided)'
    }
  }

  // Default
  const medium = (!isExternalReferrer(referrer)) ? 'internal' : 'referral'
  return {
    source: a.hostname,
    medium: medium
  }
}

/**
 * Search engine query string data
 * @type {Object}
 */
const Q = 'q'
const QUERY = 'query'
const searchEngines = {
  'daum.net': Q,
  'eniro.se': 'search_word',
  'naver.com': QUERY,
  'yahoo.com': 'p',
  'msn.com': Q,
  'aol.com': Q,
  'ask.com': Q,
  'baidu.com': 'wd',
  'yandex.com': 'text',
  'rambler.ru': 'words',
  'google': Q,
  'bing.com': {
    'p': Q,
    'n': 'live'
  },
}
