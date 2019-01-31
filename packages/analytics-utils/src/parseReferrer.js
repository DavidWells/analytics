import inBrowser from './inBrowser'
import parseParams from './paramsParse'
import isExternalReferrer from './isExternalReferrer'
import { trimTld, getDomainBase } from './url'

/**
 * Checks a given url and parses referrer data
 * @param  {String} ref - (optional) referring URL
 * @return {Object}     [description]
 */
export default function parseReferrer(referrer, currentUrl) {
  if (!inBrowser) return false
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
  const params = parseParams(currentUrl)
  const paramKeys = Object.keys(params)
  if (paramKeys.length) {
    // set campaign params off matches
    const gaParams = paramKeys.reduce((acc, key) => {
      // match utm params & dclid (display) & gclid (cpc)
      if (key.match(/^utm_/)) {
        acc[`${key.replace(/^utm_/, '')}`] = params[key]
      }
      // https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters
      // dclid - cpc Cost-Per-Thousand Impressions
      // gclid - cpc Cost per Click
      if (key.match(/^(d|g)clid/)) {
        acc['source'] = 'google'
        acc['medium'] = (params.gclid) ? 'cpc' : 'cpm'
        acc[key] = params[key]
      }
      return acc
    }, {})

    refData = Object.assign({}, refData, gaParams)

    if (params.dclid || params.gclid) {
      refData['source'] = 'google'
      refData['medium'] = (params.gclid) ? 'cpc' : 'cpm'
    }
  }
  return refData
}

/**
 * Client side domain parser for determining marketing data.
 * @param  {String} referrer - ref url
 * @return {[type]}          [description]
 */
function parseDomain(referrer) {
  if (!referrer || !inBrowser) return false

  let referringDomain = getDomainBase(referrer)
  const a = document.createElement('a')
  a.href = referrer

  // Shim for the billion google search engines
  if (a.hostname.indexOf('google') > -1) {
    referringDomain = 'google'
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
const searchEngines = {
  'daum.net': 'q',
  'eniro.se': 'search_word',
  'naver.com': 'query',
  'yahoo.com': 'p',
  'msn.com': 'q',
  'aol.com': 'q',
  'lycos.com': 'q',
  'ask.com': 'q',
  'altavista.com': 'q',
  'cnn.com': 'query',
  'about.com': 'terms',
  'alltheweb.com': 'q',
  'voila.fr': 'rdata',
  'baidu.com': 'wd',
  'alice.com': 'qs',
  'yandex.com': 'text',
  'seznam.cz': 'q',
  'search.com': 'q',
  'szukacz.pl': 'q',
  'yam.com': 'k',
  'pchome.com': 'q',
  'kvasir.no': 'q',
  'sesam.no': 'q',
  'ozu.es': 'q',
  'terra.com': 'query',
  'mynet.com': 'q',
  'ekolay.net': 'q',
  'rambler.ru': 'words',
  'google': 'q',
  'wp.pl': {
    'p': 'szukaj ',
    'n': 'wirtulana polska'
  },
  'online.onetcenter.org': {
    'p': 'qt',
    'n': 'o*net'
  },
  'najdi.org.mk': {
    'p': 'q',
    'n': 'najdi'
  },
  'search.virgilio.it': {
    'p': 'qs',
    'n': 'virgilio'
  },
  'mamma.com': {
    'p': 'query',
    'n': 'mama'
  },
  'search.netscape.com': {
    'p': 'query',
    'n': 'netscape'
  },
  'bing.com': {
    'p': 'q',
    'n': 'live'
  },
}
