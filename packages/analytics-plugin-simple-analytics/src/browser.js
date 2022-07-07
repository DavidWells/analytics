/* global sa, sa_event */

/**
 * Simple Analytics plugin
 * @link https://getanalytics.io/plugins/simple-analytics/
 * @link https://docs.simpleanalytics.com/
 * @param {object}  [pluginConfig] - Plugin settings
 * @param {string}  [pluginConfig.customDomain] - Custom domain for simple analytics script. https://docs.simpleanalytics.com/script
 * @param {string}  [pluginConfig.hostname] - Allow overwriting domain name https://docs.simpleanalytics.com/overwrite-domain-name
 * @param {boolean} [pluginConfig.collectDnt] - Allow collecting DNT visitors https://docs.simpleanalytics.com/dnt
 * @param {string}  [pluginConfig.mode] - Allow hash mode https://docs.simpleanalytics.com/hash-mode
 * @param {string}  [pluginConfig.ignorePages] - Add ignore pages https://docs.simpleanalytics.com/ignore-pages
 * @param {string}  [pluginConfig.saGlobal] - Overwrite SA global for events https://docs.simpleanalytics.com/events#the-variable-sa_event-is-already-used
 * @param {boolean} [pluginConfig.autoCollect] - Overwrite SA global for events https://docs.simpleanalytics.com/trigger-custom-page-views#use-custom-collection-anyway
 * @param {string}  [pluginConfig.onloadCallback] -  Allow onload callback https://docs.simpleanalytics.com/trigger-custom-page-views#use-custom-collection-anyway
 * @return {object} Analytics plugin
 * @example
 *
 * simpleAnalyticsPlugin()
 */
function simpleAnalyticsPlugin(pluginConfig = {}) {
  let isLoaded = false
  // Allow for userland overides of base methods
  return {
    name: 'simple-analytics',
    config: pluginConfig,
    // https://docs.simpleanalytics.com/script
    initialize: ({ config }) => {
      // Allow for a custom domain
      // https://docs.simpleanalytics.com/bypass-ad-blockers
      const domain = config.customDomain || 'scripts.simpleanalyticscdn.com'

      // Setup script
      const src = `https://${domain}/latest.js`
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.async = true
      script.src = `${src}`

      // Allow overwriting domain name
      // https://docs.simpleanalytics.com/overwrite-domain-name
      if (config.hostname) script.dataset.hostname = config.hostname;

      // Allow collecting DNT visitors
      // https://docs.simpleanalytics.com/dnt
      if (config.collectDnt) script.dataset.collectDnt = 'true';

      // Allow hash mode
      // https://docs.simpleanalytics.com/hash-mode
      if (config.mode) script.dataset.mode = config.mode;

      // Add ignore pages
      // https://docs.simpleanalytics.com/ignore-pages
      if (config.ignorePages) script.dataset.ignorePages = config.ignorePages;

      // Overwrite SA global for events
      // https://docs.simpleanalytics.com/events#the-variable-sa_event-is-already-used
      if (config.saGlobal) script.dataset.saGlobal = config.saGlobal;

      // Disable auto collect if needed
      // https://docs.simpleanalytics.com/trigger-custom-page-views#use-custom-collection-anyway
      if (config.autoCollect) script.dataset.autoCollect = config.autoCollect;

      // Allow onload callback
      // https://docs.simpleanalytics.com/trigger-custom-page-views#use-custom-collection-anyway
      if (config.onloadCallback) script.onload = config.onloadCallback;

      // Append the script to the DOM
      const el = document.getElementsByTagName('script')[0]
      el.parentNode.insertBefore(script, el)

      // Resolve the promise once the script is loaded
      script.addEventListener('load', () => {
        isLoaded = true
      })

      // Catch any errors while loading the script
      script.addEventListener('error', () => {
        throw new Error(`${src} failed to load.`)
      })
    },
    /* https://docs.simpleanalytics.com/events */
    track: ({ payload, config }) => {
      var saEventFunction = window[config.saGlobal] || window.sa_event || window.sa
      if (!saEventFunction) return false
      saEventFunction(payload.event)
    },
    /* Verify script loaded */
    loaded: () => {
      return !!isLoaded
    }
  }
}

export default simpleAnalyticsPlugin