import noOp from '../noOp'
/**
 * Get search string from given url
 * @param  {string} [url] - optional url string. If no url, window.location.search will be used
 * @return {string} url search string
 */
function getSearchFromBrowser() {
  return window.location.search.substring(1)
}

export default (process.browser) ? getSearchFromBrowser : noOp
