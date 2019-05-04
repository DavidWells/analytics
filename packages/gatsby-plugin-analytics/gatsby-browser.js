/* global Analytics */

/* Make sure you initialize the `analytics` npm package in your gatbsy source */

exports.onRouteUpdate = ({ location }, options) => {
  if (typeof Analytics !== 'undefined') {
    // On every route change fire this
    Analytics.page()
  }
}
