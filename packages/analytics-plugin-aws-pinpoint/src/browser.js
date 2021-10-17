import { initialize } from './pinpoint'
import { getStorageKey } from './pinpoint/helpers/getStorageKey'
import { CHANNEL_TYPES } from './pinpoint/helpers/constants'
import * as PINPOINT_EVENTS from './pinpoint/helpers/events'
import loadError from './utils/load-error'
import formatEventData from './utils/format-event-data'
import bootstrap from './utils/bootstrap'
import { onUserActivity } from '@analytics/activity-utils'
import { setItem, getItem, removeItem } from '@analytics/localstorage-utils'
import {
  getSession,
  setSession,
  extendSession,
  getTabSession,
  setTabSession,
  getPageSession,
  setPageSession,
} from '@analytics/session-utils'
// import { onTabChange, isTabHidden } from 'analytics-plugin-tab-events'
// import { onScrollChange } from '@analytics/scroll-utils'

// @TODO turn on consent
// let hasAnonConsent = document.cookie.match(`__anon-consent=true`)
// let hasFullConsent = document.cookie.match(`__full-consent=true`)

const config = {
  /* Disable anonymous MTU */
  disableAnonymousTraffic: false,
  // Pinpoint service region
  pinpointRegion: 'us-east-1',
  // Custom event mapping
  eventMapping: {},
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
  let tabListener
  // let scrollDepthMax = 0
  // let scrollDepthNow = 0

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
  // window.stopSession = stopSession

  function startNewSession() {
    // Set new sessions.
    const newSession = setSession(30)
    if (pluginConfig.debug) {
      console.log('START SESSION', newSession)
    }
    // @TODO do we want this here?....
    // const pageSession = generatePageSession()

    /* Fire session start event. */
    recordEvent(PINPOINT_EVENTS.SESSION_START)
  }
  // window.startSession = startNewSession

  /* return plugin */
  return {
    name: 'aws-pinpoint',
    config: {
      ...config,
      ...pluginConfig,
    },
    bootstrap: bootstrap,
    initialize: ({ config, instance }) => {
      const { disableAnonymousTraffic, debug } = config
      const logger = debug ? console.log : () => {}
      /* Disable pinpoint if user is not yet identified. */
      const state = instance.getState()
      const userDetails = state.user || {}
      const { userId, anonymousId } = userDetails
      const context = state.context || {}
      const { app, version, campaign } = context

      /* Initialize session info */
      const initPageSession = getPageSession()
      const initTabSession = getTabSession()
      const initSessionData = getSession()
      logger('initPageSession', initPageSession)
      logger('initTabSession', initTabSession)
      logger('initSessionData', initSessionData)

      /* If anonId has changed, refresh session details */
      if (
        initSessionData &&
        initSessionData.anonId &&
        initSessionData.anonId !== anonymousId
      ) {
        logger('anonId different refresh session details')
        // console.log('anonId', anonymousId)
        // console.log('initSessionData.anonId', initSessionData.anonId)
        /* Set new page session values */
        setPageSession()
        /* Set new tab session values */
        setTabSession()
        /* Set new session for new user */
        const newSessionForNewUser = setSession(30, {
          anonId: anonymousId,
          userId: userId,
        })
        logger('newSessionForNewUser', newSessionForNewUser)
      }

      /* Disable for anonymous users */
      if (!userId && disableAnonymousTraffic) {
        return false
      }

      // construct utm params
      const utmParams = Object.keys(campaign).reduce((acc, key) => {
        acc[`utm_${key}`] = campaign[key]
        return acc
      }, {})

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
            pageViewKey: config.pageViewKey,
            initialSession: initSessionData,
            // scrollDepth: scrollDepthNow,
            // scrollDepthMax
          }
        },
        enrichEventAttributes: () => {
          return {
            anonId: instance.user('anonymousId'),
            userId: instance.user('userId'),
            hash: window.location.hash,
            path: window.location.pathname,
            referrer: document.referrer,
            search: window.location.search,
            title: document.title,
            host: window.location.hostname,
            url: window.location.origin + window.location.pathname,
            ...utmParams,
          }
        },
        // Custom event mapping
        enrichUserAttributes: config.enrichUserAttributes,
        // Pass scroll into with all events
        enrichEventMetrics: () => {
          return {}
          /* {
            scrollDepth: scrollDepthNow,
            scrollDepthMax
          }*/
        },
      })

      recordEvent = pinpointClient.recordEvent
      updateEndpoint = pinpointClient.updateEndpoint

      if (initSessionData && initSessionData.isNew) {
        logger(`Start brand new session because cookie not found`)
        /* Start new session if its new */
        recordEvent(PINPOINT_EVENTS.SESSION_START)
      }

      const FIVE_MINUTES = 300e3
      const THIRTY_MINUTES = 180e4 // 1800000ms
      let SESSION_LENGTH = THIRTY_MINUTES
      // SESSION_LENGTH = 20000
      const removeActivityListener = onUserActivity({
        timeout: SESSION_LENGTH,
        throttle: 20000,
        onIdle: (activeTime, event) => {
          logger(`Session idle. Active ${activeTime} seconds`)
          // Stop session
          stopSession()
        },
        onWakeUp: (idleTime, event) => {
          logger(`Session wakeup. Idle ${idleTime} seconds`)
          // Reset session info
          startNewSession()
        },
        onHeartbeat: (timeActive, event) => {
          logger('ping session', new Date())
          logger('total active time', timeActive)
          /* Extend current session by 30 minutes */
          const user = instance.user()
          extendSession(30, {
            anonId: user.anonymousId,
            userId: user.userId,
          })
        },
      })

      /* Old session handler
      tabListener = onTabChange((isHidden) => {
        console.log('isHidden', isHidden)
        if (isHidden) {
          stopSession()
        } else {
          console.log('Reset session!')
          startNewSession()
        }
      })*/

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
      })*/
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

function getTabs() {
  return JSON.parse(getItem('TabsOpen') || '{}')
}
function setTabs(tabs) {
  setItem('TabsOpen', JSON.stringify(tabs))
}
function getTabsCount() {
  return Object.keys(getTabs()).length
}
function tabLoadEventHandler() {
  const hash = 'tab_' + +new Date()
  sessionStorage.setItem('TabHash', hash)
  let tabs = getTabs()
  tabs[hash] = true
  setTabs(tabs)
}
function tabUnloadEventHandler() {
  let hash = sessionStorage.getItem('TabHash')
  let tabs = getTabs()
  delete tabs[hash]
  setTabs(tabs)
}

/*
// updateEndpoint example
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

Config example
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
