/* global CE2 */

export const config = {
  /* Crazy egg account number */
  accountNumber: null,
}

/**
 * Crazy egg plugin
 * @link https://help.crazyegg.com/article/43-crazy-egg-manual-installation
 * @param {object} pluginConfig - Plugin settings
 * @param {string} pluginConfig.accountNumber - crazy egg account ID
 * @return {AnalyticsPlugin}
 * @example
 *
 * crazyEgg({
 *   accountNumber: '1234578'
 * })
 */
export default function crazyEgg(pluginConfig) {
  // Allow for userland overides of base methods
  return {
    NAMESPACE: 'crazy-egg',
    config: Object.assign({}, config, pluginConfig),
    initialize: ({ config }) => {
      const { accountNumber } = config
      if (!accountNumber) {
        throw new Error('No crazy egg accoint defined')
      }
      const { location } = document

      const https = location.protocol === 'https:' || location.protocol === 'chrome-extension:'
      const path = `${accountNumber.slice(0, 4)}/${accountNumber.slice(4)}`
      const bustCache = Math.floor(new Date().getTime() / 3600000)
      const prefix = (https) ? 'https:' : 'http:'
      const src = `${prefix}//script.crazyegg.com/pages/scripts/${path}.js?${bustCache}`

      // Create script & append to DOM
      let script = document.createElement('script')
      script.type = 'text/javascript'
      script.async = true
      script.src = src

      // On next tick, inject the script
      setTimeout(() => {
        let firstScript = document.getElementsByTagName('script')[0]
        firstScript.parentNode.insertBefore(script, firstScript)
      }, 0)
    },
    loaded: () => {
      return !!window.CE2
    }
  }
}
