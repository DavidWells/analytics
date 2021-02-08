import { initialize, ENDPOINT_KEY } from './pinpoint'
import { CHANNEL_TYPES } from './pinpoint/constants'
import * as PINPOINT_EVENTS from './pinpoint/events'
import { onTabChange } from 'analytics-plugin-tab-events'
// import { onScrollChange } from '@analytics/scroll-utils'
import { uuid } from 'analytics-utils'

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
 * @param {string} pluginConfig.pinpointAppId - AWS Pinpoint app Id for client side tracking
 * @param {function} pluginConfig.getCredentials - Async function to get AWS Cognito creds 
 * @param {string} [pluginConfig.pinpointRegion] - AWS Pinpoint region. Defaults to us-east-1
 * @param {string} [pluginConfig.appTitle] - The title of the app that's recording the event.
 * @param {string} [pluginConfig.appPackageName] - The name of the app package, such as com.example.my_app.
 * @param {string} [pluginConfig.appVersionCode] - The version number of the app, such as 3.2.0
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
  const eventMap = pluginConfig.eventMapping || {}
  let recordEvent 
  let updateEndpoint
  let tabListener
  let elapsedSessionTime = 0

  /* Page-session (on route changes) */
  let pageSession = uuid()

  /* Sub-session (visibility changes) */
  let subSessionId = uuid()
  let subSessionStart = Date.now()

  // let scrollDepthMax = 0
  // let scrollDepthNow = 0
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
      const { disableAnonymousTraffic } = config
      /* Disable pinpoint if user is not yet identified. */
      const state = instance.getState()
      const userID = (state.user || {}).userId
      const context = state.context || {}
      const { app, version } = context
      if (!userID && disableAnonymousTraffic) {
        return false
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
        // Get pinpoint endpoint ID
        getEndpointId: () => {
          return instance.user('anonymousId')
        },
        getUserId: () => {
          return instance.user('userId')
        },
        getContext: () => {
          return {
            elapsed: elapsedSessionTime,
            pageSession,
            subSessionId,
            subSessionStart,
            sessionKey: config.sessionKey,
            pageViewKey: config.pageViewKey,
            // scrollDepth: scrollDepthNow,
            // scrollDepthMax
          }
        },
        enrichEventAttributes: () => {
          return {}
        },
        // Pass scroll into with all events
        enrichEventMetrics: () => {
          return {}
          /*
          return {
            // scrollDepth: scrollDepthNow,
            // scrollDepthMax
          }
          */
        },
        // Custom event mapping
        eventMapping: eventMap
      })

      recordEvent = pinpointClient.recordEvent
      updateEndpoint = pinpointClient.updateEndpoint

      /* Start session */
      recordEvent(PINPOINT_EVENTS.SESSION_START)
      
      /* Scroll tracking
      function pageScrolled(data) {
        const { trigger, direction, scrollMax, scrollMin, range } = data
        // Set current scroll values 
        scrollDepthNow = trigger
        scrollDepthMax = scrollMax
        // Record page scroll event 
        recordEvent('pageScrolled')
      }

      const detachScrollListener = onScrollChange({
        // 25: pageScrolled,
        50: pageScrolled,
        75: pageScrolled,
        90: pageScrolled
      })
      */

      tabListener = onTabChange((isHidden) => {
        // console.log('isHidden', isHidden)
        if (isHidden) {
          // On hide increment elapsed time.
          elapsedSessionTime += Date.now() - subSessionStart
          // Fire session stop event.
          recordEvent(PINPOINT_EVENTS.SESSION_STOP, false)
        } else {
          // Reset subSessions.
          subSessionId = uuid()
          subSessionStart = Date.now()
          // Fire session start event.
          recordEvent(PINPOINT_EVENTS.SESSION_START)
        }
      })
    },
    page: ({ payload, config }) => {
      if (!recordEvent) {
        console.log('Pinpoint not loaded')
        return 
      }
      // Fire page view and update pageSession Id
      const queuePageView = true
      recordEvent(PINPOINT_EVENTS.PAGE_VIEW, queuePageView).then(() =>{
        pageSession = uuid()
      })
    },
    reset: ({ instance }) => {
      storage.removeItem(ENDPOINT_KEY)
    },
    track: ({ payload, config, instance }) => {
      if (!recordEvent) {
        console.log('Pinpoint not loaded')
        return 
      }
      if (config.disableAnonymousTraffic && !payload.userId) {
        return
      }
      const data = formatEventData(payload.properties)
      recordEvent(payload.event, data)
    },
    identify: ({ payload }) => {
      const { userId, traits } = payload
      if (!updateEndpoint) {
        console.log('Pinpoint not loaded')
        return 
      }
 
      const userInfo = {}
      if (userId) {
        userInfo.UserId = userId
      }
      if (traits && Object.keys(traits).length) {
        userInfo.UserAttributes = traits
      }

      // Update endpoint in AWS pinpoint
      updateEndpoint({
        ...(traits.email) ? { 
          Address: traits.email,
          ChannelType: CHANNEL_TYPES.EMAIL,
        } : {},
        ...(!Object.keys(userInfo).length) ? {} : {
          User: userInfo
        },
      })
      /* example
      updateEndpoint({
        "Address": 'jimbo@gmail.com',
        "Attributes": { "lol": ['thing'], baz: 'bar' },
        "Metrics": { "key": 1 },
        "OptOut": 'NONE',
        "User": {
          "UserAttributes": { "key": 'baz', 'waht': ['chill'] },
          "UserId": 'user-xyz'
        }
      })
      */
    },
    loaded: () => !!recordEvent,
  }
}

function formatEventData(obj) {
  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key]
    if (typeof value === 'number') {
      acc.metrics[key] = value
    }
    if (typeof value === 'string') {
      acc.attributes[key] = value
    }
    return acc
  }, {
    attributes: {},
    metrics: {}
  })
}

/*
{
  appPackageName: config.appPackageName || 'site',
  // The title of the app that's recording the event.
  appTitle: config.appTitle || '',
  // The version number of the app that's recording the event.
  appVersionCode: config.appVersionCode || '2.2.2',
  // Pinpoint service region
  pinpointRegion: config.pinpointRegion || DEFAULT_REGION,
  // Custom pinpoint endpoint
  pinpointEndpoint: config.pinpointEndpoint,
  // Pinpoint App ID
  pinpointAppId: config.pinpointAppId
  // Cognito 
  getCredentials: config.getCredentials,
  // Get pinpoint endpoint ID
  getEndpointId: () => {
    return instance.user('anonymousId')
  },
  getContext: () => {
    return {
      elapsed: elapsedSessionTime,
      pageSession,
      subSessionId,
      subSessionStart,
      scrollDepth: scrollDepthNow,
      scrollDepthMax
    }
  },
  // Pass scroll into with all events
  enrichMetrics: () => {
    return {}
  }
}
*/
export { PINPOINT_EVENTS }

export default awsPinpointPlugin
