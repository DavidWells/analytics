/**
 * Referral source plugin
 */

import { decodeUri, parseReferrer, cookie } from 'analytics-utils'

const { getCookie, setCookie } = cookie

const CONSTANTS = {
  ORIGINAL_SOURCE: '__user_original_source'
}
const EVENTS = {
  SET_ORIGINAL_SOURCE: 'setOriginalSource'
}

export default function referralSourcePlugin(config) {
  return store => next => action => {
    if (action.type === 'analyticsInit') {
      const ref = firstReferralSource()
      store.dispatch({
        type: EVENTS.SET_ORIGINAL_SOURCE,
        data: ref
      })
    }
    return next(action)
  }
}

function getOriginalSource(referrer) {
  // 1. try first source cookie
  const cookie = getCookie(CONSTANTS.ORIGINAL_SOURCE)
  if (cookie) {
    return parsePipeString(cookie)
  }
  // 2. try __utmz cookie
  const utmzCookie = getCookie('__utmz')
  if (utmzCookie) {
    const parsedCookie = parsePipeString(utmzCookie)
    if (parsedCookie) {
      return parsedCookie
    }
  }
  // 3. Try referrer url and utm params
  const ref = referrer || document.referrer
  const refData = parseReferrer(ref)
  return refData
}

/**
 * Get first referral source of visitor
 * @param  {String|optional} referrer - uri of referral site
 * @return {String}
 */
function firstReferralSource(referrer) {
  // 1. try first source cookie
  const cookie = getCookie(CONSTANTS.ORIGINAL_SOURCE)
  if (cookie) {
    // return stored referrer data
    return parsePipeString(cookie)
  }

  // Set referral data
  const originalSource = getOriginalSource(referrer)
  setCookie(CONSTANTS.ORIGINAL_SOURCE, formatCookie(originalSource))

  return originalSource
}

/**
 * Turn object into pipe separated values
 * @param  {Object} [obj={}] - Object to transform
 * @return {String} - pipe separated value
 *
 * @Example
 *
 *  formatCookie({})
 *  // utmcsr=SOURCE|utmcmd=MEDIUM[|utmccn=CAMPAIGN][|utmcct=CONTENT][|utmctr=TERM/KEYWORD]
 *
 */
function formatCookie(obj) {
  if (!obj || typeof obj !== 'object') {
    return null
  }
  return Object.keys(obj).reduce((acc, curr, i) => {
    return `${acc}${(i) ? '|' : ''}${curr}=${obj[curr]}`
  }, '')
}

/**
 * Parse utmz cookie
 * @param  {String} cookie - utmz cookie value
 * @return {Object} - parsed object of cookie
 *
 * @Example
 *
 * parsePipeString('438.1531.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none)')
 *
 * parsePipeString('16602.15.1.1.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided)')
 */
function parsePipeString(cookie) {
  const keyMap = {
    'utmcsr': 'source',
    'utmcmd': 'medium',
    'utmccn': 'campaign',
    'utmcct': 'content',
    'utmctr': 'term',
    'utmgclid': 'gclid', // Google Click ID from autotagged PPC
    'utmdclid': 'dclid', // Display Click Identifier.
  }
  const keyValues = (cookie) ? cookie.split('|') : []
  return keyValues.reduce((acc, curr, i) => {
    const val = keyValues[i].split('=')
    const key = val[0].split('.').pop()
    if (keyMap[key]) {
      acc[`${keyMap[key]}`] = decodeUri(val[1])
    } else if (typeof curr[key] === 'undefined') {
      acc[key] = decodeUri(val[1])
    }
    return acc
  }, {})
}
