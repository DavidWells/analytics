import deepmerge from 'deepmerge'
import {
  getSession,
  getTabSession,
  setTabSession,
  getPageSession,
  setPageSession,
} from '@analytics/session-utils'
import { prepareAttributes, prepareMetrics } from './prepare-data'
import { setItem, getItem, removeItem } from '@analytics/localstorage-utils'
import { isString, isBrowser } from '@analytics/type-utils'
import getClientInfo from '../../utils/client-info'
import { getStorageKey } from './getStorageKey'

const ENDPOINT_KEY = '__endpoint'

let migrationRan = false
export default async function mergeEndpointData(endpoint = {}, config = {}) {
  const {
    getUserId,
    getEndpointId,
    enrichUserAttributes,
    endpointMigration,
  } = config
  const context = grabContext(config)
  const sessionKey = context.sessionKey ? context.sessionKey() : 'sessions'
  const pageKey = context.pageViewKey ? context.pageViewKey() : 'pageViews'

  // const tabSessionInfo = getTabSession()
  let pageSessionInfo, pageSession
  let clientInfo
  if (isBrowser) {
    clientInfo = getClientInfo()
    pageSessionInfo = getPageSession()
    pageSession = pageSessionInfo.id
  }
  const sessionData = getSession()

  const id = await getEndpointId()

  // @TODO remove in next version
  if (!migrationRan) {
    migrationRan = true
    // Backwards compatible endpoint info
    const deprecatedData = getItem(ENDPOINT_KEY)
    // clear out old key value
    if (deprecatedData) {
      persistEndpoint(id, deprecatedData)
      // remove old key
      removeItem(ENDPOINT_KEY)
    }
  }

  const persistedEndpoint = getEndpoint(id)
  // const browserVersion = [clientInfo.model, clientInfo.version].join('/')
  const appVersionString = getAppVersionCode(config)

  const demographicInfo = getDemographicInfo(appVersionString, clientInfo)
  // console.log('demographicInfo', demographicInfo)

  const EndpointData = {
    Attributes: {},
    Demographic: demographicInfo,
    Location: {
      /*
      City: 'STRING_VALUE',
      Country: 'STRING_VALUE',
      Latitude: 'NUMBER_VALUE',
      Longitude: 'NUMBER_VALUE',
      PostalCode: 'STRING_VALUE',
      Region: 'STRING_VALUE'
      */
    },
    Metrics: {
      // [`${sessionKey}Unix`]: sessionData.Unix
    },
    /** Indicates whether a user has opted out of receiving messages with one of the following values:
     * ALL - User has opted out of all messages.
     * NONE - Users has not opted out and receives all messages.
     */
    // OptOut: 'STRING_VALUE',
  }

  /* Add device attributes to endpoint */
  if (isBrowser) {
    if (clientInfo.device && clientInfo.device.vendor) {
      EndpointData.Attributes.DeviceMake = [clientInfo.device.vendor]
    }
    if (clientInfo.device && clientInfo.device.model) {
      EndpointData.Attributes.DeviceModel = [clientInfo.device.model]
    }
    if (clientInfo.device && clientInfo.device.type) {
      EndpointData.Attributes.DeviceType = [clientInfo.device.type]
    }
    /*
    if (endpoint.channelType && clientInfo.os.version) {
      EndpointData.ChannelType = endpoint.channelType
    }
    */
  }

  /* Merge new endpoint data with defaults. */
  endpoint = deepmerge.all([persistedEndpoint, EndpointData, endpoint], {
    arrayMerge: overwriteMerge, // TODO maybe change array merge
  })

  // Sync user ID if it's changed
  if (endpoint.User && endpoint.User.UserId) {
    const foundId = await getUserId()
    if (endpoint.User.UserId !== foundId) {
      endpoint.User.UserId = foundId
    }
  }

  // If no ID and we have one, lets set it
  if (!endpoint.User || !endpoint.User.UserId) {
    const foundId = await getUserId()
    if (foundId) {
      endpoint.User = endpoint.User || {}
      endpoint.User.UserId = foundId
    }
  }

  /* Format attributes and metrics. */
  // const userAttributes = endpoint.User && endpoint.User.UserAttributes || {}
  // const enrichedAttributes = enrichUserFunc(userAttributes)
  // console.log('enrichedAttributes', enrichedAttributes)
  if (endpoint.User && endpoint.User.UserAttributes) {
    endpoint.User.UserAttributes = await prepareAttributes(
      endpoint.User.UserAttributes,
      true
    )
    // console.log('endpoint.User.UserAttributes', endpoint.User.UserAttributes)
  }
  endpoint.Attributes = await prepareAttributes(endpoint.Attributes, true)
  // console.log('endpoint.Attributes', endpoint.Attributes)
  endpoint.Metrics = await prepareMetrics(endpoint.Metrics)
  // console.log('endpoint.Metrics', endpoint.Metrics)

  /* Set initial session count */
  if (!endpoint.Metrics[sessionKey]) {
    endpoint.Metrics[sessionKey] = 1.0
  }
  /* Set initial page view count */
  if (!endpoint.Metrics[pageKey]) {
    endpoint.Metrics[pageKey] = 1.0
  }

  /* Custom data migration function */
  if (endpointMigration) {
    endpoint = endpointMigration(id, endpoint)
  }

  /* If this is first session, set values and return */
  const hasPreviousSession = endpoint.Attributes.lastSession
  if (!hasPreviousSession) {
    endpoint.Attributes.lastSessionDate = [sessionData.createdAt]
    endpoint.Attributes.lastSession = [sessionData.id]
    // @TODO persist tab info
    // endpoint.Attributes.lastTabSession = [ tabSessionInfo.id ]
    if (pageSession) {
      endpoint.Attributes.lastPageSession = [pageSession]
    }
    // Store the endpoint data.
    // console.log('Set initital endpoint info')
    return persistEndpoint(id, endpoint)
  }

  /* If current sessionId is different than lastSession */
  if (hasPreviousSession && hasPreviousSession[0] !== sessionData.id) {
    endpoint.Attributes.lastSessionDate = [sessionData.createdAt]
    endpoint.Attributes.lastSession = [sessionData.id]
    endpoint.Metrics[sessionKey] += 1.0
    // console.log('Update lastSession info', sessionData.id)
  }
  // Increment pageViews.
  if (endpoint.Attributes.lastPageSession[0] !== pageSession) {
    endpoint.Attributes.lastPageSession = [pageSession]
    endpoint.Metrics[pageKey] += 1.0
    // console.log('Update lastPageSession info', pageSession)
  }

  // Store the endpoint data.
  return persistEndpoint(id, endpoint)
}

function persistEndpoint(id, endpointData) {
  const endpointKey = getStorageKey(id)
  const data = isString(endpointData) ? endpointData : JSON.stringify(endpointData)
  setItem(endpointKey, data)
  return endpointData
}

function getEndpoint(id) {
  try {
    return JSON.parse(getItem(getStorageKey(id))) || {}
  } catch (error) {}
  return {}
}

function getDemographicInfo(appVersionString, clientInfo) {
  return isBrowser
    ? getBrowserDemographicInfo(appVersionString, clientInfo)
    : getServerDemographicInfo(appVersionString)
}

function getServerDemographicInfo(appVersionString) {
  const demographicInfo = {
    AppVersion: appVersionString,
    Make: 'generic server',
    Platform: 'Node.js',
    PlatformVersion: process.version,
  }

  return demographicInfo
}

function getBrowserDemographicInfo(appVersionString, clientInfo) {
  const demographicInfo = {
    // AppTitle/0.0.0. Maps to application.version_name in kinesis stream
    AppVersion: appVersionString,
    /* The locale of the endpoint, in the following format: 
       the ISO 639-1 alpha-2 code, followed by an underscore (_), 
       followed by an ISO 3166-1 alpha-2 value. 
    */
    Locale: clientInfo.language,
    // Maker - Google/Mozilla/Apple
    Make: clientInfo.make,
    // Model - Safari/Chrome/Brave/Opera
    Model: clientInfo.model,
    // ModelVersion - 91.0.0
    ModelVersion: clientInfo.version,
    // Platform - os name
    Platform: clientInfo.os.name || clientInfo.platform,
    // PlatformVersion: browserVersion,
    // Timezone: 'STRING_VALUE'
  }

  if (clientInfo.os && clientInfo.os.version) {
    demographicInfo.PlatformVersion = clientInfo.os.version
  }

  return demographicInfo
}

function getAppVersionCode(config) {
  const appName = config.appTitle || config.appPackageName || ''
  const appVersion = config.appVersionCode || '0.0.0'
  return appName ? `${appName}@${appVersion}` : appVersion
}

/**
 * Array merge function for deepmerge.
 *
 * @param {Array} destinationArray
 * @param {Array} sourceArray
 */

function overwriteMerge(_destinationArray, sourceArray) {
  return sourceArray
}

function grabContext({ getContext }) {
  if (typeof getContext === 'function') {
    return getContext()
  }
  return getContext
}
