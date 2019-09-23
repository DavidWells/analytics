import { escapeRegexString, isArrayParam } from './utils/regex'
/**
 * Strip a query parameter from a url string
 * @param  {string} url   - url with query parameters
 * @param  {string|RegExp} param - parameter to strip. String or regex
 * @return {string} cleaned url
 */
export default function paramsClean(param, url) {
  /* eslint-disable no-sparse-arrays */
  const isString = typeof param === 'string'
  const search = (url.split('?') || [ , ])[1]
  if (!search || (isString && search.indexOf(param) === -1)) {
    return url
  }
  let pattern
  if (isString) {
    // If exact match on word boundary only
    const bounds = isArrayParam(param) ? '' : '\\b'
    pattern = `${bounds}${escapeRegexString(param)}${bounds}`
  } else {
    // Is Regex pattern for wildcard matches
    pattern = param instanceof RegExp && param.source
  }
  // construct regex
  const regex = new RegExp(`(\\&|\\?)?${pattern}([^&]+)`, 'g')
  // Clean search string
  const cleanSearch = `?${search}`.replace(regex, '').replace(/^&/, '?')
  // replace search params with clean params
  const cleanURL = url.replace(`?${search}`, cleanSearch)
  // return url without the params
  return cleanURL
}
