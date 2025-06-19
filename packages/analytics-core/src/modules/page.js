// Page View Reducer. Follows ducks pattern http://bit.ly/2DnERMc
import { isBrowser } from '@analytics/type-utils'
import serialize from '../utils/serialize'

import EVENTS from '../events'

const hashRegex = /#.*$/

function canonicalUrl() {
  if (!isBrowser) return
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
  const pathMatch = (matches && matches[3]) ? matches[3].split('?')[0].replace(hashRegex, '') : ''
  return '/' + pathMatch
}

/**
 * Return the canonical URL and rmove the hash.
 * @param  {string} search - search param
 * @return {string} return current canonical URL
 */
function currentUrl(search) {
  const canonical = canonicalUrl()
  if (!canonical) return window.location.href.replace(hashRegex, '')
  return canonical.match(/\?/) ? canonical : canonical + search
}

/**
 * Page data for overrides
 */

/**
 * Get information about current page
 * @param {PageData} [pageData={}] - Page data overrides
 * @returns {PageData} resolved page data
 */
export const getPageData = (pageData = {}) => {
  if (!isBrowser) return pageData
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

const initialState = {
  last: {},
  history: [],
}

// page reducer
export default function page(state = initialState, action) {
  const { properties, options, meta } = action
  switch (action.type) {
    case EVENTS.page:
      const viewData = serialize({
        properties,
        meta,
        ...(Object.keys(options).length) && { options: options },
      })
      return {
        ...state,
        ...{
          last: viewData,
          // Todo prevent LARGE arrays https://bit.ly/2MnBwPT
          history: state.history.concat(viewData)
        }
      }
    default:
      return state
  }
}
