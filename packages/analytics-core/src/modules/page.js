// Page View Reducer. Follows ducks pattern http://bit.ly/2DnERMc
import inBrowser from '../utils/inBrowser'
import EVENTS from '../events'

function canonicalUrl() {
  if (!inBrowser) return
  const tags = document.getElementsByTagName('link')
  for (var i = 0, tag; tag = tags[i]; i++) {
    if (tag.getAttribute('rel') === 'canonical') {
      return tag.getAttribute('href')
    }
  }
}

function urlPath(url) {
  const regex = /(http[s]?:\/\/)?([^\/\s]+\/)(.*)/g
  const matches = regex.exec(url)
  const pathMatch = (matches && matches[3]) ? matches[3].split('?')[0].replace(/#.*$/, '') : ''
  return `/${pathMatch}`
}

/**
 * Return the canonical URL and rmove the hash.
 * @param  {string} search - search param
 * @return {string} return current canonical URL
 */
function currentUrl(search) {
  const canonical = canonicalUrl()
  if (!canonical) return window.location.href.replace(/#.*$/, '')
  return canonical.match(/\?/) ? canonical : `${canonical}${search}`
}

export const getPageData = (pageData = {}) => {
  if (!inBrowser) return pageData
  const { title, referrer } = document
  const { location, innerWidth, innerHeight } = window
  const { hash, search } = location
  const url = currentUrl(search)
  const page = {
    title: title,
    url: url,
    path: urlPath(url),
    hash: hash,
    search: search,
    width: innerWidth,
    height: innerHeight,
  }
  if (referrer && referrer !== '') {
    page.referrer = referrer
  }

  return {
    ...page,
    /* .page() user overrrides */
    ...pageData
  }
}

// initialState Page Data
const initialState = getPageData()

// page reducer
export default function page(state = initialState, action) {
  switch (action.type) {
    case EVENTS.page:
      return Object.assign({}, state, action.data)
    default:
      return state
  }
}
