/**
 * Cleans params from from url
 */
export default function paramsClean(url, param) {
  const search = (url.split('?') || [,])[1]
  if (!search || search.indexOf(param) === -1) {
    return url
  }
  // remove all utm params from URL search
  const regex = new RegExp(`(\\&|\\?)${param}([_A-Za-z0-9=\.%]+)`, 'g')
  const cleanSearch = `?${search}`.replace(regex, '').replace(/^&/, '?')
  // replace search params with clean params
  const cleanURL = url.replace(`?${search}`, cleanSearch)
  // use browser history API to clean the params
  return cleanURL
}
