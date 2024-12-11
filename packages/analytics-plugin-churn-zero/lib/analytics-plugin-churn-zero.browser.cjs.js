'use strict';

require('unfetch');

/* global ChurnZero */

/**
 * ChurnZero plugin
 * @link https://getanalytics.io/plugins/churn-zero
 * @link https://support.churnzero.com/hc/en-us/articles/360004683552-Integrate-ChurnZero-using-Javascript
 * @param {object} pluginConfig - Plugin settings
 * @param {string} pluginConfig.appKey - ChurnZero AppKey
 * @param {string} pluginConfig.subdomain - ChurnZero AppKey
 * @param {string} pluginConfig.whitelistedEvents - An optional list of events to track
 * @return {AnalyticsPlugin}
 * @example
 *
 * This will load ChurnZero on to the page
 * churnZeroPlugin({
 *   appKey: '1234578'
 *   subdomain: 'mycompanydomain'
 * })
 */
function churnZeroPlugin() {
  var pluginConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return {
    name: 'churn-zero',
    config: pluginConfig,
    initialize: function initialize(_ref) {
      var config = _ref.config;
      var appKey = config.appKey,
        subdomain = config.subdomain;
      if (!appKey) {
        throw new Error('No ChurnZero appKey defined');
      }
      if (!subdomain) {
        throw new Error('No ChurnZero subdomain defined');
      }

      // Create script & append to DOM
      var script = document.createElement('script');
      var firstScript = document.getElementsByTagName('script')[0];
      script.type = 'text/javascript';
      script.async = true;
      script.src = "https://".concat(subdomain, ".churnzero.net/churnzero.js");
      firstScript.parentNode.insertBefore(script, firstScript);
    },
    identify: function identify(_ref2) {
      var payload = _ref2.payload,
        config = _ref2.config;
      var _payload$traits = payload.traits,
        company = _payload$traits.company,
        email = _payload$traits.email,
        firstName = _payload$traits.firstName,
        lastName = _payload$traits.lastName;
      if (typeof ChurnZero === 'undefined') return;
      if (config.appKey) {
        ChurnZero.push(['setAppKey', config.appKey]);
      }
      if (company && company.id && email) {
        ChurnZero.push(['setContact', company.id, email]);
      }
      if (firstName) {
        ChurnZero.push(['setAttribute', 'contact', 'FirstName', firstName]);
      }
      if (lastName) {
        ChurnZero.push(['setAttribute', 'contact', 'LastName', lastName]);
      }
      if (email) {
        ChurnZero.push(['setAttribute', 'contact', 'Email', email]);
      }
    },
    track: function track(_ref3) {
      var payload = _ref3.payload,
        config = _ref3.config;
      if (typeof ChurnZero === 'undefined') return;
      if (config.whitelistedEvents && !config.whitelistedEvents.includes(payload.event)) return;
      ChurnZero.push(['trackEvent', payload.event, undefined, undefined, payload.properties]);
    },
    loaded: function loaded() {
      return !!window.ChurnZero;
    }
  };
}

/* This module will shake out unused code and work in browser and node 🎉 */
var index = churnZeroPlugin ;

module.exports = index;
