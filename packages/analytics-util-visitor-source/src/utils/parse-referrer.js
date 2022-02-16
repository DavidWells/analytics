import { parseUrl, getSearch, isExternal, getDomain, trimTld } from '@analytics/url-utils'
import {
  AFFILIATE,
  CAMPAIGN,
  DIRECT,
  INBOUND,
  INTERNAL,
  SOCIAL,
  SEARCH,
  NA,
} from '../constants'

const Q = 'q'
const QUERY = 'query'
const googleKey = 'google'

/**
 * Search engine query string data
 * @type {Object}
 */
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
  'duckduckgo.com': Q,
  'bing.com': Q,
}

const socials = [
  ['twitter.com', 't.co'],
  ['facebook.com', 'fb.me' ],
  ['linkedin.com', 'lnkd.in'],
  ['vimeo.com'],
  ['pinterest.com']
]

/**
 * @typedef {{
 *  result: string,
 *  referrer: string,
 *  hostname: string,
 *  domain: string,
 *  isExternal: boolean,
 *  term?: string
 * }} ReferralData
 */

/**
 * 
 * @param {string} [referrer] 
 * @param {string} [currentUrl] 
 * @returns {ReferralData}
 */
export function parseReferrer(referrer = '', currentUrl) {
  const urlData = parseUrl(referrer)
  const domain = getDomain(urlData.hostname)
  const external = isExternal(referrer, currentUrl)
  const params = currentUrl ? getSearch(currentUrl) : {}
  /*
  const local = isLocalHost(referrer)
  console.log('isExternal', external)
  console.log('urlData', urlData)
  console.log('params', params)
  /** */
  let result = {
    type: (!referrer) ? DIRECT : (external) ? INBOUND : INTERNAL,
    referrer: referrer,
    isExternal: external,
    ts: new Date().toISOString()
  }
  if (urlData.hostname) {
    result.hostname = urlData.hostname
  }
  if (domain) {
    result.domain =domain
  }

  const { ref, utm_medium } = params

  /* UTM parameters */
  if (utm_medium) {
    const campaign = checkGA(params)
    // console.log('campaign', campaign)
    result = {
      ...result,
      ...campaign,
      type: CAMPAIGN
    }
  }

  /* Affiliate Link */
  if (ref) {
    return {
      ...result,
      type: AFFILIATE,
      value: ref
    }
  }

  if (!domain) {
    return result
  }

  /* Check search engines */
  const name = (domain.indexOf(googleKey) > -1) ? googleKey : domain
  const engineKey = searchEngines[name]
  if (engineKey) {
    const term = getSearch(referrer, engineKey)
    return {
      ...result,
      type: SEARCH,
      term: term || NA,
      value: trimTld(name),
    }
  }

  /* Check socials */
  const isSocial = socials.find((urls) => urls.some((url) => domain === url))
  // console.log('isSocial', isSocial)
  if (isSocial) {
    result.domain = isSocial[0]
    if (result.type !== AFFILIATE) {
      result.type = SOCIAL
    }
  }
  return result
}

function checkGA(search) {
  const paramKeys = Object.keys(search)
  // set campaign params off GA matches
  return paramKeys.reduce((acc, key) => {
    // match utm params & dclid (display) & gclid (cpc)
    if (key.match(/^utm_/)) {
      acc[`${key.replace(/^utm_/, '')}`] = search[key]
    }
    // https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters
    // dclid - cpc Cost-Per-Thousand Impressions
    // gclid - cpc Cost per Click
    if (key.match(/^(d|g)clid/)) {
      acc['source'] = googleKey
      acc['medium'] = (search.gclid) ? 'cpc' : 'cpm'
      acc[key] = search[key]
    }
    return acc
  }, {})
}