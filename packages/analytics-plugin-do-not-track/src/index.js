
// Todo design API for doNotTrack to allow for fine grained permissions
export default function doNotTrackPlugin(userConfig = {}) {
  return {
    name: 'do-not-track',
    config: Object.assign({}, userConfig),
    initializeStart: ({ abort, config }) => {
      if (doNotTrackEnabled()) {
        return abort('Cancel the initialize call because do-not-track enabled')
      }
    },
    pageStart: ({ abort, config }) => {
      if (doNotTrackEnabled()) {
        return abort('Cancel the page call because do-not-track enabled')
      }
    },
    identifyStart: ({ abort, config }) => {
      if (doNotTrackEnabled()) {
        return abort('Cancel the identify call because do-not-track enabled')
      }
    },
    trackStart: ({ abort, config }) => {
      if (doNotTrackEnabled()) {
        return abort('Cancel the track call because do-not-track enabled')
      }
    },
  }
}

export function doNotTrackEnabled() {
  if (typeof window === 'undefined') return false

  const { doNotTrack, navigator } = window
  // Do Not Track Settings
  const dnt = (doNotTrack || navigator.doNotTrack || navigator.msDoNotTrack || msTracking())

  if (!dnt) {
    return false
  }

  if (dnt === true || dnt === 1 || dnt === 'yes' || (typeof dnt === 'string' && dnt.charAt(0) === '1')) {
    return true
  }

  return false
}

function msTracking() {
  const { external } = window
  return typeof external !== 'undefined' &&
  'msTrackingProtectionEnabled' in external &&
  typeof external.msTrackingProtectionEnabled === 'function' &&
  window.external.msTrackingProtectionEnabled()
}

/* server implementation
function isDoNotTrackEnabled(request) {
  const doNotTrackHeader = request.header('DNT')

  if (!doNotTrackHeader) {
    return false
  }

  if (doNotTrackHeader.charAt(0) === '1') {
    return true
  }

  return false
}
*/
