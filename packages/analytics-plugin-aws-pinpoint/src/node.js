import { initialize } from './pinpoint'
import { CHANNEL_TYPES } from './pinpoint/constants'
import * as PINPOINT_EVENTS from './pinpoint/events'
import {
  getSession,
  setSession,
} from '@analytics/session-utils'

const config = {
  /* Disable anonymous MTU */
  disableAnonymousTraffic: false,
  // Pinpoint service region
  pinpointRegion: 'us-east-1',
  // Custom event mapping
  eventMapping: {}
}

/**
 * AWS Pinpoint analytics integration
 * @link https://docs.aws.amazon.com/pinpoint/latest/developerguide/
 * @param {object} pluginConfig - Plugin settings
 * @param {string} pluginConfig.pinpointAppId - AWS Pinpoint app Id for server side tracking
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
 * awsPinpointServer({
 *   pinpointAppId: '938bebb1ae954e123133213160f2b3be4',
 *   getCredentials: () => Auth.currentCredentials(),
 * })
 */
function awsPinpointServer(pluginConfig = {}) {
  let recordEvent 
  let updateEndpoint

  
  function stopSession() {
    const currentSessionData = getSession()
    if (pluginConfig.debug) {
      console.log('Stop session', currentSessionData)
    }
    // Fire session stop event.
    recordEvent(PINPOINT_EVENTS.SESSION_STOP, true)
  }

  function startNewSession() {
    // Set new sessions.
    const newSession = setSession(30)
    if (pluginConfig.debug) {
      console.log('START SESSION', newSession)
    }

    /* Fire session start event. */
    recordEvent(PINPOINT_EVENTS.SESSION_START)
  }

  /* return plugin */
  return {
    name: 'aws-pinpoint',
    config: {
      ...config,
      ...pluginConfig
    },
    bootstrap: (pluginApi) => {
      const { config, instance } = pluginApi
      /* Load aws-pinpoint script after userId exists */
      if (config.disableAnonymousTraffic && !instance.user('userId')) {
        instance.once('identifyStart', ({ plugins }) => {
          const self = plugins['aws-pinpoint']
          if (!self.loaded()) {
            instance.loadPlugin('aws-pinpoint')
          }
        })
      }
    },
    initialize: ({ config, instance }) => {
      console.log('changing 7 test logic into node')
      const { disableAnonymousTraffic, debug } = config
      const logger = (debug) ? console.log : () => {}
      /* Disable pinpoint if user is not yet identified. */
      // const state = instance.getState()
      // const userDetails = state.user || {}
      // const { userId, anonymousId } = userDetails
      // const context = state.context || {}
      // const { app, version, campaign } = context

      /* Initialize session info */
      const initSessionData = getSession()
      logger('initSessionData', initSessionData)
  
      /* If anonId has changed, refresh session details */
      if (initSessionData && initSessionData.anonId && initSessionData.anonId !== anonymousId) {
        logger('anonId different refresh session details')
      }

      /* Initialize pinpoint client */
      const pinpointClient = initialize({
        ...config,
        eventMapping: config.eventMapping,
        // Get pinpoint endpoint ID
        getEndpointId: () => {
          return instance.user('anonymousId')
        },
        getContext: () => {
          return {
            sessionKey: config.sessionKey,
            initialSession: initSessionData,
          }
        },
        enrichEventAttributes: () => {
          return {
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
        logger(`Start brand new session because cookie not found`)
        /* Start new session if its new */
        recordEvent(PINPOINT_EVENTS.SESSION_START)
      }
    },
    /* Track event & update endpoint details */
    track: ({ payload, config, instance }) => {
      if (!recordEvent) {
        return loadError()
      }
      if (config.disableAnonymousTraffic && !payload.userId) {
        return
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
      if (traits.email) {
        endpoint.Address = traits.email,
        endpoint.ChannelType = CHANNEL_TYPES.EMAIL
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

function loadError() {
  throw new Error('Pinpoint not loaded')
}

function formatEventData(obj) {
  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key]
    if (typeof value === 'number') {
      acc.metrics[key] = value
    }
    if (typeof value === 'string' || typeof value === 'boolean') {
      acc.attributes[key] = value
    }
    return acc
  }, {
    attributes: {},
    metrics: {}
  })
}

export { PINPOINT_EVENTS }

export default awsPinpointServer
