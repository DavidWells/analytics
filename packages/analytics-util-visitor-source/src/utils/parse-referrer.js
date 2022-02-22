import { 
  parseUrl, 
  getSearch,
  decode,
  getUrl, 
  getDomain,
  isExternal, 
  trimTrailingSlash,
  trimTld 
} from '@analytics/url-utils'
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
  const { search, hash, hostname } = parseUrl(currentUrl)
  const currentDomain = getDomain(hostname)
  const refData = parseUrl(referrer)
  const refDomain = getDomain(refData.hostname)
  const params = decode(search)
  const isInternal = currentDomain === refDomain
  const isSubDomain = isInternal && (hostname !== refData.hostname)
  const external = isExternal(referrer, currentUrl)
  const isExternalLink = external && !isSubDomain
  /*
  // const local = isLocalHost(referrer)
  console.log('isExternal', external)
  console.log('refData', refData)
  console.log('params', params)
  /** */
  let result = {
    type: (!referrer) ? DIRECT : (isExternalLink) ? INBOUND : INTERNAL,
    date: new Date().toISOString(),
    entry: {
      url: getUrl(currentUrl),
      search,
      hash
    },
    referrer: {
      url: trimTrailingSlash(referrer),
      hostname: refData.hostname,
      domain: refDomain,
      isExternal: isExternalLink,
      isInternal,
      isInternalSubDomain: isSubDomain,
    },
  }

  const { ref, utm_medium, utm_source } = params

  /* UTM parameters */
  if (utm_medium || utm_source) {
    const campaign = checkGA(params)
    // console.log('campaign', campaign)
    result = {
      ...result,
      type: CAMPAIGN,
      data: campaign,
    }
  }

  /* Affiliate Link */
  if (ref) {
    result = {
      ...result,
      type: AFFILIATE,
      data: { 
        id: ref 
      }
    }
  }

  if (!refDomain) {
    return result
  }

  /* Check search engines */
  const name = (refDomain.indexOf(googleKey) > -1) ? googleKey : refDomain
  const engineKey = searchEngines[name]
  if (engineKey) {
    const term = getSearch(referrer, engineKey)
    return {
      ...result,
      type: SEARCH,
      data: {
        term: term || NA,
        name: trimTld(name),
      }
    }
  }

  /* Check socials */
  const isSocial = socials.find((urls) => urls.some((url) => refDomain === url))
  // console.log('isSocial', isSocial)
  if (isSocial) {
    if (result.type !== AFFILIATE) {
      result.type = SOCIAL
    }
    result.data = {
      ...result.data,
      site: isSocial[0],
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