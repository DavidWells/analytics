import { isBrowser } from '@analytics/type-utils'

/**
 * Get host domain of url
 * @param  {String} url - href of page
 * @return {String} hostname of page
 *
 * @example
 *  getDomainHost('https://subdomain.my-site.com/')
 *  > subdomain.my-site.com
 */
export function getDomainHost(url) {
  if (!isBrowser) return null
  const a = document.createElement('a')
  a.setAttribute('href', url)
  return a.hostname
}

/**
 * Get host domain of url
 * @param  {String} url - href of page
 * @return {String} base hostname of page
 *
 * @example
 *  getDomainBase('https://subdomain.my-site.com/')
 *  > my-site.com
 */
export function getDomainBase(url) {
  const host = getDomainHost(url) || ''
  return host.split('.').slice(-2).join('.')
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

export default {
  trimTld,
  getDomainBase,
  getDomainHost
}
