/* global sa */

/**
 * Simple Analytics plugin
 * @link https://getanalytics.io/plugins/simple-analytics/
 * @link https://simpleanalytics.com/
 * @return {object} Analytics plugin
 * @example
 *
 * simpleAnalyticsPlugin()
 */
export default function simpleAnalyticsPlugin(pluginConfig = {}) {
  let isLoaded = false
  // Allow for userland overides of base methods
  return {
    NAMESPACE: 'simple-analytics',
    config: pluginConfig,
    // https://docs.simpleanalytics.com/script
    initialize: ({ config }) => {
      const src = 'https://cdn.simpleanalytics.io/hello.js'
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.async = true
      script.src = `${src}`

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
      // Todo load analytics script via users subdomain for custom event tracking
    },
    /* https://docs.simpleanalytics.com/events
    track: ({ payload }) => {
      if (typeof sa === 'undefined') return false
      sa(payload.event)
    },
    */
    /* Verify script loaded */
    loaded: () => {
      return !!isLoaded
    }
  }
}
