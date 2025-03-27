
let Analytics
if (!process.browser) {
  Analytics = require('analytics-node')
}

const defaultConfig = {
  /* Your segment write key */
  writeKey: null,
  /* Segment sdk config options. Docs https://github.com/segmentio/analytics-next/blob/master/packages/node/src/app/settings.ts#L4C25-L4C25 */
  flushInterval: 1000,
  /* enable or disable sending events */
  disable: false,
  /* Disable anonymous MTU */
  disableAnonymousTraffic: false
}

/**
 * Segment serverside analytics plugin
 * @link https://getanalytics.io/plugins/segment/
 * @link https://segment.com/docs/connections/sources/catalog/libraries/server/node/
 * @param {object}  pluginConfig - Plugin settings
 * @param {string}  pluginConfig.writeKey - Key that corresponds to your Segment.io project
 * @param {boolean} [pluginConfig.disableAnonymousTraffic] - Disable loading segment for anonymous visitors
 * @param {string}  [pluginConfig.host] - The base URL of the API. Default: "https://api.segment.io"
 * @param {string}  [pluginConfig.path] - The API path route. Default: "/v1/batch"
 * @param {number}  [pluginConfig.maxRetries] - The number of times to retry flushing a batch. Default: 3
 * @param {number}  [pluginConfig.maxEventsInBatch] - The number of messages to enqueue before flushing. Default: 15
 * @param {number}  [pluginConfig.flushInterval] - The number of milliseconds to wait before flushing the queue automatically. Default: 10000
 * @param {number}  [pluginConfig.httpRequestTimeout] - The maximum number of milliseconds to wait for an http request. Default: 10000
 * @param {boolean} [pluginConfig.disable] - Disable the analytics library. All calls will be a noop. Default: false.
 * @param {HTTPFetchFn | HTTPClient} [pluginConfig.httpClient] - Supply a default http client implementation 
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

  const { disableAnonymousTraffic, ...segmentConfig } = config  

  const client = new Analytics({
    ...segmentConfig
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
    page: ({ payload }) => {
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
    track: ({ payload }) => {
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
      if (disableAnonymousTraffic && !userId) {
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