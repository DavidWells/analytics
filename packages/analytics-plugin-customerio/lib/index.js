/**
 * Customer.io analytics integration
 */
import initialize from './initialize'
import track from './track'
import page from './page'
import identify from './identify'

const NAMESPACE = 'customerio'

export {
  NAMESPACE,
  initialize,
  track,
  page,
  identify,
}

module.exports = function customerIO(config) {
  return {
    NAMESPACE: NAMESPACE,
    initialize: function() {
      return initialize(config.siteId)
    },
    page: page,
    track: track,
    identify: identify,
    config: {
      assumesPageview: true
    },
    loaded: () => {
      return !!(window._cio && window._cio.push !== Array.prototype.push)
    }
  }
}
