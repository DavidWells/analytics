/**
 * Browser implementation
 */

const config = {}

/* Export the integration */

export default function simpleAnalyticsPlugin(userConfig) {
  let isLoaded = false
  // Allow for userland overides of base methods
  return {
    NAMESPACE: 'simple-analytics',
    config: {
      ...config,
      ...userConfig
    },
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
    },
    /* Verify script loaded */
    loaded: () => {
      return !!isLoaded
    }
  }
}
