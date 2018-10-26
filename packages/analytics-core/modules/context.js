// Context Reducer
/* global BUILD_WEB BUILD_NODE */
import { inBrowser } from 'analytics-utils'
import EVENTS from '../events'
import getOSNameNode from '../utils/getOSName/node'
import getOSNameBrowser from '../utils/getOSName/browser'

let osName
if (BUILD_WEB) {
  osName = getOSNameBrowser()
}

if (BUILD_NODE) {
  osName = getOSNameNode()
}

const initialState = {
  initialized: false,
  app: null,
  version: null,
  debug: false,
  os: {
    name: osName,
  },
  userAgent: (inBrowser) ? navigator.userAgent : 'node', // https://github.com/bestiejs/platform.js
  library: {
    name: 'analytics',
    // TODO fix version number. npm run publish:patch has wrong version
    version: process.env.VERSION || 'devmode'
  },
  campaign: {}
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
  return Object.keys(config).reduce((accumulator, current) => {
    if (current === 'plugins' || current === 'reducers') {
      return accumulator
    }
    accumulator[current] = config[current]
    return accumulator
  }, {})
}
