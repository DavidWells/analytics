// Context Reducer.  Follows ducks pattern http://bit.ly/2DnERMc
import { getBrowserLocale, getTimeZone, uuid } from 'analytics-utils'
import { isBrowser } from '@analytics/type-utils'
import EVENTS from '../events'
import { LIBRARY_NAME } from '../utils/internalConstants'
import getOSNameNode from '../utils/getOSName/node'
import getOSNameBrowser from '../utils/getOSName/browser'

let osName
let referrer
let locale
let timeZone
if (process.browser) {
  osName = getOSNameBrowser()
  referrer = (isBrowser) ? document.referrer : null
  locale = getBrowserLocale()
  timeZone = getTimeZone()
} else {
  osName = getOSNameNode()
  referrer = {}
}

const initialState = {
  initialized: false,
  sessionId: uuid(),
  app: null,
  version: null,
  debug: false,
  offline: (isBrowser) ? !navigator.onLine : false, // use node network is-online
  os: {
    name: osName,
  },
  userAgent: (isBrowser) ? navigator.userAgent : 'node', // https://github.com/bestiejs/platform.js
  library: {
    name: LIBRARY_NAME,
    // TODO fix version number. npm run publish:patch has wrong version
    version: process.env.VERSION
  },
  timezone: timeZone,
  locale: locale,
  campaign: {},
  referrer: referrer,
}

// context reducer
export default function context(state = initialState, action) {
  const { initialized } = state
  const { type, campaign } = action
  switch (type) {
    case EVENTS.campaign:
      return {
        ...state,
        ...{ campaign: campaign }
      }
    case EVENTS.offline:
      return {
        ...state,
        ...{ offline: true }
      }
    case EVENTS.online:
      return {
        ...state,
        ...{ offline: false }
      }
    default:
      if (!initialized) {
        return {
          ...initialState,
          ...state,
          ...{ initialized: true }
        }
      }
      return state
  }
}

const excludeItems = ['plugins', 'reducers', 'storage']
// Pull plugins and reducers off intital config
export function makeContext(config) {
  return Object.keys(config).reduce((acc, current) => {
    if (excludeItems.includes(current)) {
      return acc
    }
    acc[current] = config[current]
    return acc
  }, {})
}
