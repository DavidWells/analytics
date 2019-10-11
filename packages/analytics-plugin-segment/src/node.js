
let Analytics
if (!process.browser) {
  Analytics = require('analytics-node')
}

const config = {
  /* Your segment write key */
  writeKey: null,
  /* Segment sdk flushInterval. Docs https://bit.ly/2H2jJMb */
  flushInterval: 3,
  /* Disable anonymous MTU */
  disableAnonymousTraffic: false
}

const NAMESPACE = 'segment'

/**
 * Segment serverside analytics plugin
 * @link https://getanalytics.io/plugins/segment/
 * @link https://segment.com/docs/sources/website/analytics.js/
 * @param {object}  pluginConfig - Plugin settings
 * @param {string}  pluginConfig.writeKey - Your segment writeKey
 * @param {boolean} [pluginConfig.flushInterval] - Segment sdk flushInterval. Docs https://bit.ly/2H2jJMb
 * @param {boolean} [pluginConfig.disableAnonymousTraffic] - Disable loading segment for anonymous visitors
 * @return {object} Analytics plugin
 * @example
 *
 * segmentPlugin({
 *   writeKey: '123-xyz'
 * })
 */
function segmentPlugin(userConfig = {}) {
  // Initialize segment client
  const segmentConfig = {
    ...config,
    ...userConfig
  }
  const client = new Analytics(segmentConfig.writeKey, {
    flushInterval: segmentConfig.flushInterval
  })
  return {
    NAMESPACE: NAMESPACE,
    config: segmentConfig,
    /* page view */
    page: ({ payload, config }) => {
      client.page({
        properties: payload.properties
      })
    },
    /* track event */
    track: ({ payload, config }) => {
      const { userId, anonymousId } = payload
      if (!userId && !anonymousId) {
        throw new Error('Missing userId and anonymousId. You must include one to make segment call')
      }

      const data = {
        event: payload.event,
        properties: payload.properties
      }

      if (userId) {
        data.userId = userId
      } else {
        data.anonymousId = anonymousId
      }

      // Save boat loads of cash
      if (config.disableAnonymousTraffic && !userId) {
        return false
      }

      client.track(data)
    },
    /* identify user */
    identify: ({ payload }) => {
      const { userId, traits } = payload
      client.identify({ userId, traits })
    }
  }
}

export default segmentPlugin
