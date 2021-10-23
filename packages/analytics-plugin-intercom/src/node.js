import { isEmail } from '@analytics/type-utils'

let Intercom;
if (!process.browser) {
  Intercom = require('intercom-client');
}

const defaultConfig = {
  /* Your intercom app id */
  appId: null,
}

/**
 * Segment serverside analytics plugin
 * @link https://getanalytics.io/plugins/intercom/
 * @link https://github.com/intercom/intercom-node/
 * @param {object}  pluginConfig - Plugin settings
 * @param {string}  pluginConfig.appId - Your Intercom app id
 * @return {object} Analytics plugin
 * @example
 *
 * intercomPlugin({
 *   appId: '123-xyz'
 * })
 */
function intercomPlugin(userConfig = {}) {
  const config = {
    ...defaultConfig,
    ...userConfig,
  }

  const client = new Intercom.Client({ token: config.appId })

  return {
    name: 'intercom',
    config: config,
    // Custom intercom methods
    methods: {
      // Function for using intercom-node client in other methods
      getClient: () => client,
    },
    /* page view */
    page: ({ payload, config }) => {
      console.log('page event not yet implemented, doesn\'t seem to be available from node sdk')
    },
    /* track event */
    track: ({ payload, config }) => {
      const { userId } = payload
      if (!userId && !anonymousId) {
        throw new Error('Missing userId. You must include one to make intercom call')
      }
      const data = {
        event_name: payload.event,
        created_at: Math.floor(new Date().getTime() / 1000),
        user_id: userId,
        metadata: payload.properties,
      }
      client.events.create(data)
    },
    /* identify user */
    identify: ({ payload }) => {
      const { userId, traits } = payload

      const email = isEmail(userId) ? userId : traits.email
      if (!email) {
        throw new Error('Missing email. userId or traits.email must be set')
      }

      client.users.create({
        email: email, 
        custom_attributes: traits
      })
    },
  }
}

export default intercomPlugin
