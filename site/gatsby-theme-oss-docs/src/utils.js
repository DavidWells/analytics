/* global ga */
function trackEvent(options) {
  if (typeof ga === 'function') {
    ga('send', 'event', options);
  }
}

function getVersionBasePath(version) {
  return `/v${version}`;
}

exports.trackEvent = trackEvent;
exports.getVersionBasePath = getVersionBasePath;
exports.GA_EVENT_CATEGORY_CODE_BLOCK = 'Code Block';
exports.GA_EVENT_CATEGORY_SIDEBAR = 'Sidebar';
