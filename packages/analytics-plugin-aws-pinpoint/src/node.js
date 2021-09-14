import { initialize, getStorageKey } from './pinpoint/index-node'
import { CHANNEL_TYPES } from './pinpoint/constants'
import * as PINPOINT_EVENTS from './pinpoint/events'
import {
  getSession,
  setSession,
  getPageSession, 
  setPageSession,
} from '@analytics/session-utils'

const config = {
  // Pinpoint service region
  pinpointRegion: 'us-east-1',
  // Custom event mapping
  eventMapping: {}
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
 * @return {object} Analytics plugin
 * @example
 *
 * awsPinpointNode({
 *   pinpointAppId: '938bebb1ae954e123133213160f2b3be4',
 *   getCredentials: () => Auth.currentCredentials(),
 * })
 */
function awsPinpointNode(pluginConfig = {}) {
  let recordEvent 
  let updateEndpoint

  /* Page-session (on route changes) */
  let hasPageFiredOnce = false
  
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
      if (!instance.user('userId')) {
        instance.once('identifyStart', ({ plugins }) => {
          const self = plugins['aws-pinpoint']
          if (!self.loaded()) {
            instance.loadPlugin('aws-pinpoint')
          }
        })
      }
    },
    initialize: ({ config, instance }) => {
      console.log('5 - AWS Pinpoint Analytics Server Implementation')
      const { debug } = config
      const logger = (debug) ? console.log : () => {}
      /* Disable pinpoint if user is not yet identified. */
      const state = instance.getState()
      const userDetails = state.user || {}
      const { userId, anonymousId } = userDetails
      const context = state.context || {}
      const { app, version } = context

      /* Initialize session info */
      const initPageSession = getPageSession()
      const initSessionData = getSession()
      logger('initPageSession', initPageSession)
      logger('initSessionData', initSessionData)
      /* If anonId has changed, refresh session details */
      if (initSessionData && initSessionData.anonId && initSessionData.anonId !== anonymousId) {
        logger('anonId different refresh session details')
        /* Set new page session values */
        setPageSession()
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
            // pageViewKey: config.pageViewKey,
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
        logger(`Start brand new session because cookie not found`)
        /* Start new session if its new */
        recordEvent(PINPOINT_EVENTS.SESSION_START)
      }
    },
    page: ({ payload, config }) => {
      if (!recordEvent) {
        return loadError()
      }
      // Fire page view and update pageSessionInfo Id
      if (hasPageFiredOnce) {
        // Set new page session values
        setPageSession()
      }
      recordEvent(PINPOINT_EVENTS.PAGE_VIEW)
      hasPageFiredOnce = true
    },
    /* Track event & update endpoint details */
    track: ({ payload, config, instance }) => {
      if (!recordEvent) {
        return loadError()
      }
      if (!payload.userId) {
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
    /* Reset user details */
    reset: ({ instance }) => {
      const id = instance.user('anonymousId')
      const key = getStorageKey(id)
      storage.removeItem(key)
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

export default awsPinpointNode
