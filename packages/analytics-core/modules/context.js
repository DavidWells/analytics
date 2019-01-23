// Context Reducer.  Follows ducks pattern http://bit.ly/2DnERMc
/* global BUILD_WEB BUILD_NODE */
import { inBrowser, parseReferrer, getBrowserLocale, getTimeZone, uuid } from 'analytics-utils'
import EVENTS from '../events'
import getOSNameNode from '../utils/getOSName/node'
import getOSNameBrowser from '../utils/getOSName/browser'

let osName
let referrer
let locale
let timeZone
if (BUILD_WEB) {
  osName = getOSNameBrowser()
  referrer = parseReferrer()
  locale = getBrowserLocale()
  timeZone = getTimeZone()
}

if (BUILD_NODE) {
  osName = getOSNameNode()
  referrer = {}
}

const initialState = {
  initialized: false,
  sessionId: uuid(),
  app: null,
  version: null,
  debug: false,
  offline: (inBrowser) ? !navigator.onLine : false, // use node network is-online
  os: {
    name: osName,
  },
  userAgent: (inBrowser) ? navigator.userAgent : 'node', // https://github.com/bestiejs/platform.js
  library: {
    name: 'analytics',
    // TODO fix version number. npm run publish:patch has wrong version
    version: process.env.VERSION || 'devmode'
  },
  timezone: timeZone,
  locale: locale,
  campaign: {},
  referrer: referrer,
  // ip:
}

// context reducer
export default function context(state = initialState, action) {
  const { initialized } = state
  const { type, campaign } = action
  switch (type) {
    case EVENTS.SET_CAMPAIGN:
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

// Pull plugins and reducers off intital config
export function makeContext(config) {
  return Object.keys(config).reduce((acc, current) => {
    if (current === 'plugins' || current === 'reducers') {
      return acc
    }
    acc[current] = config[current]
    return acc
  }, {})
}
