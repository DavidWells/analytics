
let PostHog
if (!process.browser) {
  PostHog = require('posthog-node').PostHog
}

const defaultConfig = {
  /* Your PostHog API key */
  apiKey: null,
  /* PostHog API host. Default: https://us.i.posthog.com */
  apiHost: 'https://us.i.posthog.com',
  /* Flush interval in milliseconds */
  flushInterval: 10000,
  /* Flush at this number of events */
  flushAt: 20,
  /* Disable anonymous traffic to save on events */
  disableAnonymousTraffic: false,
}

/**
 * PostHog serverside analytics plugin
 * @link https://getanalytics.io/plugins/posthog/
 * @link https://posthog.com/docs/libraries/node
 * @param {object}  pluginConfig - Plugin settings
 * @param {string}  pluginConfig.apiKey - Your PostHog project API key
 * @param {string}  [pluginConfig.apiHost] - PostHog API host (default: https://us.i.posthog.com)
 * @param {number}  [pluginConfig.flushInterval] - Flush interval in ms (default: 10000)
 * @param {number}  [pluginConfig.flushAt] - Flush at this number of events (default: 20)
 * @param {boolean} [pluginConfig.disableAnonymousTraffic] - Disable anonymous traffic (default: false)
 * @return {object} Analytics plugin
 * @example
 *
 * posthogPlugin({
 *   apiKey: 'phc_xxx',
 *   apiHost: 'https://us.i.posthog.com'
 * })
 */
function posthogPlugin(userConfig = {}) {
  const config = {
    ...defaultConfig,
    ...userConfig,
  }

  const { apiKey, apiHost, flushInterval, flushAt, disableAnonymousTraffic } = config

  if (!apiKey) {
    throw new Error('No PostHog apiKey defined')
  }

  const client = new PostHog(apiKey, {
    host: apiHost,
    flushInterval: flushInterval,
    flushAt: flushAt,
  })

  return {
    name: 'posthog',
    config: config,
    /* Track page views */
    page: ({ payload }) => {
      const { userId, anonymousId } = payload
      const distinctId = userId || anonymousId
      if (!distinctId) {
        throw new Error('Missing userId and anonymousId. You must include one to make a PostHog call')
      }

      client.capture({
        distinctId: distinctId,
        event: '$pageview',
        properties: payload.properties,
      })
    },
    /* Track custom events */
    track: ({ payload }) => {
      const { userId, anonymousId } = payload
      const distinctId = userId || anonymousId
      if (!distinctId) {
        throw new Error('Missing userId and anonymousId. You must include one to make a PostHog call')
      }

      if (disableAnonymousTraffic && !userId) {
        return false
      }

      client.capture({
        distinctId: distinctId,
        event: payload.event,
        properties: payload.properties,
      })
    },
    /* Identify a user and set person properties */
    identify: ({ payload }) => {
      const { userId, traits } = payload
      if (!userId) return

      client.identify({
        distinctId: userId,
        properties: traits,
      })
    },
    /* Custom methods */
    methods: {
      /**
       * Associate user with a group
       * @param {string} groupType - Type of group (e.g., 'company')
       * @param {string} groupKey - Unique group identifier
       * @param {object} [groupProperties] - Optional properties to set on the group
       */
      group(groupType, groupKey, groupProperties) {
        const analyticsInstance = this.instance
        const user = analyticsInstance.user()
        const distinctId = user.userId || user.anonymousId
        if (!distinctId) return

        client.groupIdentify({
          groupType: groupType,
          groupKey: groupKey,
          properties: groupProperties,
        })
      },
      /**
       * Create an alias for a user
       * @param {string} distinctId - The distinct ID to alias
       * @param {string} alias - The alias to assign
       */
      alias(distinctId, alias) {
        client.alias({
          distinctId: distinctId,
          alias: alias,
        })
      },
      /**
       * Flush all pending events
       * @return {Promise} Resolves when flush completes
       */
      flush() {
        return client.flush()
      },
      /**
       * Shutdown the client (flush + close)
       * @return {Promise} Resolves when shutdown completes
       */
      shutdown() {
        return client.shutdown()
      },
      /**
       * Get the underlying PostHog Node client instance
       * @return {object} The posthog-node client
       */
      getClient() {
        return client
      },
    },
  }
}

export default posthogPlugin
