import { isBrowser, isUndefined } from '@analytics/type-utils'
import { isExternal, getLocation } from '@analytics/url-utils'
import { parseReferrer } from './utils/parse-referrer'

/**
 * Get referrer 
 * @param {string | null | undefined} referrer
 * @returns {string | undefined}
 */
export function getReferrer(referrer) {
  return (isUndefined(referrer) && isBrowser) ? document.referrer : referrer
}

/**
 * @param {string | null | undefined} referrer
 * @param {string?} currentUrl
 * @returns {boolean | undefined}
 */
export function isExternalReferrer(referrer, current) {
  return isExternal(getReferrer(referrer), current)
}

/**
 * Get visitor source
 * @returns {object}
 */
export function getVisitorSource({
  referrer,
  currentUrl,
  mapper
}) {
  const location = getLocation(currentUrl)
  const refData = parseReferrer(
    getReferrer(referrer), // Referrer
    location.href // Current Href
  )
  return (mapper) ? mapper(refData) : refData
}

export { parseReferrer }

export * from './constants'