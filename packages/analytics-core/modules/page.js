// Page View Module
import EVENTS from '../events'
import getIntegrationsWithMethod from '../utils/getIntegrationsWithMethod'
import getCallbackFromArgs from '../utils/getCallback'
import isInBrowser from '../utils/isInBrowser'

export const getPageData = (pageData = {}) => {
  // in node, return {}
  if (!isInBrowser) {
    return pageData
  }
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
const initialState = getPageData()

// page reducer
export default function page(state = initialState, action) {
  switch (action.type) {
    case EVENTS.PAGE:
      return Object.assign({}, state, action.data)
    default:
      return state
  }
}

export const pageView = (data, options, callback) => {
  return {
    type: EVENTS.PAGE_START,
    data: data,
    options: options,
    callback: callback
  }
}
