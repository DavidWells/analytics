import { decodeUri } from 'analytics-utils'
import { isObject } from '@analytics/type-utils'

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
export function formatPipeString(obj) {
  if (!isObject(obj)) return
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
export function parsePipeString(cookie) {
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
