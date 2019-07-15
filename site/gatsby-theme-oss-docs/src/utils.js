/* global ga */
function trackEvent(options) {
  if (typeof ga === 'function') {
    ga('send', 'event', options)
  }
}

function getVersionBasePath(version) {
  return `/v${version}`
}

const sizes = {
  sm: 600,
  md: 850,
  lg: 1120
}

exports.breakpoints = Object.keys(sizes).reduce(
  (acc, key) => ({
    ...acc,
    [key]: `@media (max-width: ${sizes[key]}px)`
  }),
  {}
)

exports.trackEvent = trackEvent
exports.getVersionBasePath = getVersionBasePath
exports.GA_EVENT_CATEGORY_CODE_BLOCK = 'Code Block'
exports.GA_EVENT_CATEGORY_SIDEBAR = 'Sidebar'
