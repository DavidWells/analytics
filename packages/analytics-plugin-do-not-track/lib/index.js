const doNot = false

export default function doNotTrackPlugin(userConfig = {}) {
  return {
    NAMESPACE: 'do-not-track',
    config: Object.assign({}, userConfig),
    pageStart: ({ abort, config }) => {
      if (doNot) {
        // return abort('abort segment track call', ['segment'])
        return abort('Cancel the page call because do-not-track plugin enabled')
      }
    },
    identifyStart: ({ abort, config }) => {
      if (doNot) {
        // return abort('abort segment track call', ['segment'])
        return abort('Cancel the identify call because do-not-track plugin enabled')
      }
    },
    trackStart: ({ abort, config }) => {
      if (doNot) {
        // return abort('abort segment track call', ['segment'])
        return abort('Cancel the track call because do-not-track plugin enabled')
      }
    },
  }
}
