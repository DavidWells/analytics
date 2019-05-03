
// Todo design API for doNotTrack to allow for fine grained permissions
export default function doNotTrackPlugin(userConfig = {}) {
  return {
    NAMESPACE: 'do-not-track',
    config: Object.assign({}, userConfig),
    initializeStart: ({ abort, config }) => {
      if (config.enabled) {
        return abort('Cancel the initialize call because do-not-track plugin enabled')
      }
    },
    pageStart: ({ abort, config }) => {
      if (config.enabled) {
        return abort('Cancel the page call because do-not-track plugin enabled')
      }
    },
    identifyStart: ({ abort, config }) => {
      if (config.enabled) {
        // return abort('abort segment track call', ['segment'])
        return abort('Cancel the identify call because do-not-track plugin enabled')
      }
    },
    trackStart: ({ abort, config }) => {
      if (config.enabled) {
        // return abort('abort segment track call', ['segment'])
        return abort('Cancel the track call because do-not-track plugin enabled')
      }
    },
  }
}
