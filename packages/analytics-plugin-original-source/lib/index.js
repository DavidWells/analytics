/**
 * Referral source plugin
 */

import { decodeUri, parseReferrer, cookie, storage } from 'analytics-utils'

const EVENTS = {
  SET_ORIGINAL_SOURCE: 'setOriginalSource'
}

const CONFIG = {
  storageKey: '__user_original_source'
}

/**
 * Track original source of visitors.
 * @param  {Object} config - settings for referral source tracking
 * @param  {String} config.storage - overide the location of storage. 'LocalStorage', 'cookie', or 'window'
 * @param  {String} config.storageKey - overide the storage key. Default '__user_original_source'
 * @return {Function} - middleware for `analytics`
 */
export default function originalSourcePlugin(config) {
  return store => next => action => {
    if (action.type === 'analyticsInit') {
      const refData = firstReferralSource(config)
      store.dispatch({
        type: EVENTS.SET_ORIGINAL_SOURCE,
        data: refData
      })
    }
    return next(action)
  }
}

function getOriginalSource(referrer, opts) {
  const config = opts || {}
  const key = config.storageKey || CONFIG.storageKey
  // 1. try first source cookie
  const originalSrc = storage.getItem(key, config)
  if (originalSrc) {
    return parsePipeString(originalSrc)
  }
  // 2. try __utmz cookie
  const utmzCookie = cookie.getCookie('__utmz')
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
function firstReferralSource(config) {
  const conf = config || {}
  const key = conf.storageKey || CONFIG.storageKey
  // TODO refactor settings to mesh better with storage opts
  const storageSettings = (!conf.storage) ? {} : { storage: conf.storage }
  // 1. try first source cookie
  const originalSrc = storage.getItem(key, storageSettings)
  if (originalSrc) {
    // return stored referrer data
    return parsePipeString(originalSrc)
  } else {
    // Set referral data
    const originalSource = getOriginalSource(conf.referrer)
    storage.setItem(key, formatPipeString(originalSource), storageSettings)
    return originalSource
  }
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
function formatPipeString(obj) {
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
