/* global Analytics */

/* Make sure you initialize the `analytics` npm package in your gatbsy source */

exports.onRouteUpdate = ({ location }, options) => {
  if (typeof Analytics !== 'undefined') {
    if (options && options.debug) {
      console.log('analytics.page() called')
    }
    // On every route change fire this code!!
    Analytics.page()
  }
}
