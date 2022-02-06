
let Analytics
if (!process.browser) {
  Analytics = require('analytics-node')
}

const defaultConfig = {
  /* Your segment write key */
  writeKey: null,
  /* Segment sdk config options. Docs https://bit.ly/2H2jJMb */
  flushInterval: 1000,
  flushAt: 1,
  /* enable or disable flush */
  enable: true,
  /* Disable anonymous MTU */
  disableAnonymousTraffic: false
}

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
  const config = {
    ...defaultConfig,
    ...userConfig
  }
  const client = new Analytics(config.writeKey, {
    ...config
  })

  return {
    name: 'segment',
    config: config,
    // Custom segment methods
    methods: {
      // Segment group call https://segment.com/docs/connections/sources/catalog/libraries/server/node/#group
      group(groupId, traits = {}, options = {}, callback) {
        const analyticsInstance = this.instance
        const user = analyticsInstance.user()
        const userId = options.userId || user.userId
        const anonymousId = options.anonymousId || user.anonymousId
        client.group({
          ...(anonymousId ? { anonymousId } : {}),
          ...(userId ? { userId } : {}),
          groupId: groupId,
          traits: traits,
        }, callback)
      },
      // Function for using analytics-node client in other methods
      getClient: () => client,
    },
    /* page view */
    page: ({ payload, config }) => {
      const { userId, anonymousId } = payload
      if (!userId && !anonymousId) {
        throw new Error('Missing userId and anonymousId. You must include one to make segment call')
      }

      const data = {
        properties: payload.properties,
        anonymousId,
        userId
      }

      client.page(data)
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
    },
  }
}

export default segmentPlugin