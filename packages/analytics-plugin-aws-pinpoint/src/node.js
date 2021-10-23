import { initialize } from './pinpoint'
import * as PINPOINT_EVENTS from './pinpoint/helpers/events'
import loadError from './utils/load-error'
import formatEventData from './utils/format-event-data'
import bootstrap from './utils/bootstrap'
import { getSession, setSession } from '@analytics/session-utils'

const config = {
  /* Disable anonymous MTU */
  disableAnonymousTraffic: false,
  // Pinpoint service region
  pinpointRegion: 'us-east-1',
  // Custom event mapping
  eventMapping: {},
}


/**
 * AWS Pinpoint analytics Node integration
 * @link https://docs.aws.amazon.com/pinpoint/latest/developerguide/
 * @param {object} pluginConfig - Plugin settings
 * @param {string} pluginConfig.pinpointAppId - AWS Pinpoint app Id for client side tracking
 * @param {function} pluginConfig.getCredentials - Async function to get AWS Cognito creds
 * @param {string} [pluginConfig.pinpointRegion] - AWS Pinpoint region. Defaults to us-east-1
 * @param {string} [pluginConfig.appTitle] - The title of the app that's recording the event.
 * @param {string} [pluginConfig.appPackageName] - The name of the app package, such as com.example.my_app.
 * @param {string} [pluginConfig.appVersionCode] - The version number of the app, such as 3.2.0
 * @param {string} [pluginConfig.fips] - Use the AWS FIPS service endpoint for Pinpoint
 * @param {boolean} [pluginConfig.disableAnonymousTraffic] -  Disable anonymous events from firing
 * @return {object} Analytics plugin
 * @example
 *
 * awsPinpointPlugin({
 *   pinpointAppId: '938bebb1ae954e123133213160f2b3be4',
 *   getCredentials: () => Auth.currentCredentials(),
 * })
 */
function awsPinpointPlugin(pluginConfig = {}) {
  let recordEvent
  let updateEndpoint

  /* return plugin */
  return {
    name: 'aws-pinpoint',
    config: {
      ...config,
      ...pluginConfig,
    },
    bootstrap: bootstrap,
    initialize: ({ config, instance }) => {
      const { debug } = config
      const logger = debug ? console.log : () => {}
      
      /* Disable pinpoint if user is not yet identified. */
      const state = instance.getState()
      const userDetails = state.user || {}
      const { userId, anonymousId } = userDetails
      const context = state.context || {}
      const { app, version } = context

      /* Initialize session info */
      const initSessionData = getSession()
      logger('initSessionData', initSessionData)

      /* If anonId has changed, refresh session details */
      if (
        initSessionData &&
        initSessionData.anonId &&
        initSessionData.anonId !== anonymousId
      ) {
        logger('anonId different refresh session details')
        /* Set new session for new user */
        const newSessionForNewUser = setSession(30, {
          anonId: anonymousId,
          userId: userId,
        })
        logger('newSessionForNewUser', newSessionForNewUser)
      }

      /* Initialize pinpoint client */
      const pinpointClient = initialize({
        ...config,
        // flushInterval
        flushInterval: config.flushInterval || 200,
        // The title of the app that's recording the event.
        appTitle: config.appTitle || app,
        // The package name of the app that's recording the event.
        appPackageName: config.appPackageName || app,
        // The version number of the app that's recording the event.
        appVersionCode: config.appVersionCode || version,
        // Custom event mapping
        eventMapping: config.eventMapping,
        // Get pinpoint endpoint ID
        getEndpointId: () => {
          return instance.user('anonymousId')
        },
        getUserId: () => {
          return instance.user('userId')
        },
        getContext: () => {
          return {
            sessionKey: config.sessionKey,
            initialSession: initSessionData,
          }
        },
        enrichEventAttributes: () => {
          return {
            anonId: instance.user('anonymousId'),
            userId: instance.user('userId'),
          }
        },
        // Custom event mapping
        enrichUserAttributes: config.enrichUserAttributes,
        // Pass scroll into with all events
        enrichEventMetrics: () => {
          return {}
        },
      })
      recordEvent = pinpointClient.recordEvent
      updateEndpoint = pinpointClient.updateEndpoint

      if (initSessionData && initSessionData.isNew) {
        logger(`Start brand new session`)
        /* Start new session if its new */
        recordEvent(PINPOINT_EVENTS.SESSION_START)
      }
    },
    /* Track event & update endpoint details */
    track: ({ payload }) => {
      if (!recordEvent) {
        return loadError()
      }
      const data = formatEventData(payload.properties)
      recordEvent(payload.event, data)
    },
    /* Update endpoint details */
    identify: ({ payload }) => {
      const { userId, traits } = payload
      if (!updateEndpoint) {
        return loadError()
      }
      const endpoint = {}
      const userInfo = {}

      if (userId) {
        userInfo.UserId = userId
      }
      if (traits && Object.keys(traits).length) {
        userInfo.UserAttributes = traits
      }
      if (Object.keys(userInfo).length) {
        endpoint.User = userInfo
      }
      // Update endpoint in AWS pinpoint
      updateEndpoint(endpoint, true)
    },
    loaded: () => !!recordEvent,
  }
}

export { PINPOINT_EVENTS }

export default awsPinpointPlugin
