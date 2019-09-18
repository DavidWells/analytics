import getSearchFromBrowser from './fromBrowser'

/**
 * Get search string from given url
 * @param  {string} [url] - optional url string. If no url, window.location.search will be used
 * @return {string} url search string
 */
export default function getSearch(url) {
  if (!url) return getSearchFromBrowser()
  const p = url.match(/\?(.*)/)
  return (p && p[1]) ? p[1].split('#')[0] : ''
}
