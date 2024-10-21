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
function churnZeroPlugin(pluginConfig = {}) {
  return {
    name: 'churn-zero',
    config: pluginConfig,
    initialize: ({ config }) => {
      const { appKey, subdomain } = config
      if (!appKey) {
        throw new Error('No ChurnZero appKey defined')
      }
      if (!subdomain) {
        throw new Error('No ChurnZero subdomain defined')
      }

      // Create script & append to DOM
      const script = document.createElement('script');
      const firstScript = document.getElementsByTagName('script')[0];
      script.type = 'text/javascript';
      script.async = true;
      script.src = `https://${subdomain}.churnzero.net/churnzero.js`;
      firstScript.parentNode.insertBefore(script, firstScript);
    },
    identify: ({ payload, config }) => {
      const { company, email, name, firstName, lastName } = payload.traits

      if (typeof ChurnZero === 'undefined') return

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
    track: ({ payload, config }) => {
      if (typeof ChurnZero === 'undefined') return

      if (config.whitelistedEvents && !config.whitelistedEvents.includes(payload.event)) return

      ChurnZero.push(['trackEvent', payload.event, undefined, undefined, payload.properties]);
    },
    loaded: () => {
      return !!window.ChurnZero
    },
  }
}

export default churnZeroPlugin
