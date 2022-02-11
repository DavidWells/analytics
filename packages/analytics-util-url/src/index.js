const URL_REGEX = /^(https?)?(?:[\:\/]*)([a-z0-9\.-]*)(?:\:(\d+))?(\/[^?#]*)?(?:\?([^#]*))?(?:#(.*))?$/i

/* Zero dependency backward compatible url parser */
export function parseUrl(url = '') {
  const match = url.match(URL_REGEX)
  return {
    protocol: match[1] || '',
    hostname: match[2] || '',
    port: match[3] || '',
    path: match[4] || '',
    query: match[5] || '',
    hash: match[6] || '',
  }
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