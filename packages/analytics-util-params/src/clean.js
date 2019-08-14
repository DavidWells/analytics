/**
 * Strip a query parameter from a url string
 * @param  {string} url   - url with query parameters
 * @param  {string} param - parameter to strip
 * @return {string} cleaned url
 */
export default function paramsClean(url, param, opts = {}) {
  /* eslint-disable no-sparse-arrays */
  const search = (url.split('?') || [ , ])[1]
  if (!search || search.indexOf(param) === -1) {
    return url
  }
  // If exact match on word boundary only
  const paramToFind = (opts.exact) ? `\\b${param}\\b` : param
  // construct regex
  const regex = new RegExp(`(\\&|\\?)${paramToFind}([_A-Za-z0-9"+=.\\/\\-@%]+)`, 'g')
  // Clean search string
  const cleanSearch = `?${search}`.replace(regex, '').replace(/^&/, '?')
  // replace search params with clean params
  const cleanURL = url.replace(`?${search}`, cleanSearch)
  // return url without the params
  return cleanURL
}
