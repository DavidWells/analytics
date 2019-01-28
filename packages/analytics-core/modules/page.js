// Page View Reducer. Follows ducks pattern http://bit.ly/2DnERMc
import { inBrowser } from 'analytics-utils'
import EVENTS from '../events'

export const getPageData = (pageData = {}) => {
  if (!inBrowser) return pageData
  const { title, referrer } = document
  const { location, innerWidth, innerHeight } = window
  const { hash, search, pathname, href } = location
  const page = {
    title: title,
    url: href,
    path: pathname,
    hash: hash,
    search: search,
    width: innerWidth,
    height: innerHeight,
    ...pageData
  }
  if (referrer && referrer !== '') {
    page.referrer = referrer
  }
  return page
}

// initialState Page Data
const initialState = {
  ...getPageData()
}

// page reducer
export default function page(state = initialState, action) {
  switch (action.type) {
    case EVENTS.page:
      return Object.assign({}, state, action.data)
    default:
      return state
  }
}
