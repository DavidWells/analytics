import deepmerge from 'deepmerge'
import { uuid } from 'analytics-utils'
import { getSession, getPageSession } from '@analytics/session-utils'
import smartQueue from '@analytics/queue-utils'
import { setItem, getItem, removeItem } from '@analytics/localstorage-utils'
import getEventName from './get-event-name'
import { CHANNEL_TYPES } from './constants'
import * as PINPOINT_EVENTS from './events'

let AWS
if (!process.browser) {
  AWS = require('@aws-sdk/client-pinpoint')
}

const { SESSION_START, SESSION_STOP } = PINPOINT_EVENTS
const BEACON_SUPPORTED =
  typeof navigator !== 'undefined' &&
  navigator &&
  typeof navigator.sendBeacon === 'function'

const ENDPOINT_KEY = '__endpoint'
const RETRYABLE_CODES = [429, 500]
const ACCEPTED_CODES = [202]
const FORBIDDEN_CODE = 403
const BAD_REQUEST_CODE = 400

let clientInfo = {}

function noOp() {
  return {}
}

const EMAIL_REGEX = /.+\@.+\..+/
function isEmail(string) {
  return EMAIL_REGEX.test(string)
}

export { ENDPOINT_KEY }

export function initialize(config = {}) {
  const configuration = {
    getContext: config.getContext || noOp,
    credentials: config.credentials || {},
    getEndpointId: config.getEndpointId,
    ...config,
  }
  

  const logger = configuration.debug ? console.log : () => {}

  // Create function that sends to pinpoint
  const pinpointPutEvent = createPinpointSender(configuration)
  const queue = smartQueue(
    async (events, rest) => {
      events.forEach((event) => logger('>>>>> PROCESS queue', event))
      const response = await pinpointPutEvent(events, {})
      logger('>>>>> PROCESS queue response', response)
    },
    {
      max: 10, // limit... event limit is 100 for pinpoint
      interval: 3000, // 3s
      throttle: true, // Ensure only max is processed at interval
    }
  )

  /* Create instance of recordEvent queue */
  const queueEvent = createEventQueue(queue, configuration)

  /* Run initialize endpoint merge */
  mergeEndpointData({}, config)

  function updateEndpoint(endpoint) {
    // console.log('Call update immediately')
    return pinpointPutEvent([], endpoint)
  }
  // Function to detach listeners
  return {
    updateEndpoint,
    recordEvent: queueEvent,
    disable: () => {
      detachUnloadListener()
    },
  }
}

export function getStorageKey(id) {
  return `${ENDPOINT_KEY}.${id}`
}

function getEndpoint(id) {
  try {
    return JSON.parse(getItem(getStorageKey(id))) || {}
  } catch (error) {}
  return {}
}

function persistEndpoint(id, endpointData) {
  const endpointKey = getStorageKey(id)
  const data =
    typeof endpointData === 'string'
      ? endpointData
      : JSON.stringify(endpointData)
  setItem(endpointKey, data)
  return endpointData
}

function createEventQueue(queue, config = {}) {
  return async function queueEvent(
    eventName,
    eventData = {},
    endpoint = {},
    flush = false
  ) {
    if (typeof eventData === 'boolean') {
      eventData = {}
      flush = eventData
    }
    if (typeof endpoint === 'boolean') {
      endpoint = {}
      flush = endpoint
    }
    const eventPayload = await formatEvent(eventName, eventData, config)

    // IF endpoint exists, & event is PAGE_VIEW, update user attributes
    if (
      Object.entries(endpoint).length ||
      eventName === PINPOINT_EVENTS.PAGE_VIEW
    ) {
      endpoint = await mergeEndpointData(endpoint, config)
    }

    if (BEACON_SUPPORTED) {
      // console.log('Beacon supported')
    }

    if (eventName === PINPOINT_EVENTS.SESSION_STOP) {
      // console.log('PINPOINT_EVENTS.SESSION_STOP fired')
      // TODO maybe skip queue and just sign requeest here
    }

    // Store sent events to queue
    queue.push(eventPayload)

    // If config setting to send every event as it happens
    if (flush) {
      return queue.flush()
    }
  }
}

function sortEvents(events) {
  return events
    .sort((a, b) => {
      const eventA = a.EventType
      const eventB = b.EventType
      // Send SESSION_START to front
      if (eventA == SESSION_START) return -1
      if (eventB == SESSION_START) return 1
      // Send SESSION_STOP to back
      if (eventA == SESSION_STOP) return 1
      if (eventB == SESSION_STOP) return -1
      return
    })
    .reduce((acc, event) => {
      return {
        ...event,
        ...acc,
      }
    }, {})
}

function createPinpointSender(config = {}) {
  const { getEndpointId, debug } = config

  return async function pinpointPutEvent(eventsArray = [], endpointInfo = {}) {
    /* Events are associated with an endpoint ID. */
    const id = await getEndpointId()
    // console.log('resolved endpointId', endpointId)
    if (!id) {
      console.error('No endpoint id. check getEndpointId()')
      return
    }
    config.anonId = id
    const hasEndpoint =
      typeof endpointInfo === 'object' && Object.keys(endpointInfo).length
    const endpoint = !hasEndpoint
      ? getEndpoint(id)
      : await mergeEndpointData(endpointInfo, config)

    let channelType = endpoint.ChannelType
    // If email is set, set email channel
    if (endpoint.Address && isEmail(endpoint.Address)) {
      channelType = CHANNEL_TYPES.EMAIL
    }

    if (!channelType && endpoint.Address) {
      if (clientInfo.platform === 'android') {
        channelType = channelType || CHANNEL_TYPES.GCM
      } else {
        channelType = channelType || CHANNEL_TYPES.APNS
      }
    }

    if (debug) {
      console.log('Endpoint', endpoint)
      if (channelType) console.log('CHANNEL_TYPE', channelType)
    }

    // Build endpoint data.
    endpoint.RequestId = uuid()
    endpoint.ChannelType = channelType

    if (endpoint.Address) {
      // https://amzn.to/3bYC5gp
      endpoint.OptOut = endpoint.OptOut || 'NONE'
    }

    // Build events request object.
    const events = sortEvents(eventsArray)
    const eventsRequest = formatPinpointBody(id, endpoint, events)

    let response
    let error
    try {
      response = await callAWS(eventsRequest, config)
    } catch (err) {
      console.log('Error calling AWS', err)
      error = err
    }
    return {
      endpoint,
      response,
      error: error,
      events: eventsArray,
    }
  }
}

function formatPinpointBody(endpointId, endpoint, events) {
  return {
    BatchItem: {
      [endpointId]: {
        Endpoint: endpoint,
        Events: events,
      },
    },
  }
}

export async function formatEvent(eventName, data = {}, config = {}) {
  const {
    appTitle,
    appPackageName,
    appVersionCode,
    eventMapping,
    enrichEventAttributes,
    enrichEventMetrics,
    debug,
  } = config
  const logger = debug ? console.log : () => {}
  const type = getEventName(eventName, eventMapping)
  const pageSessionInfo = getPageSession()
  const sessionData = getSession()
  // @TODO refactor session grabber
  const sessionId = sessionData.id
  const sessionStart = sessionData.createdAt
  const sessionStartUnix = data.sessionStart
    ? new Date(data.sessionStart).getTime()
    : sessionData.created
  logger('event pageSessionInfo', JSON.stringify(pageSessionInfo))
  logger('event sessionData    ', JSON.stringify(sessionData))

  const eventAttribs = data.attributes || {}
  const eventId = data.eventId || uuid()
  const time = data.time ? new Date(data.time) : new Date()
  const timeStamp = time.toISOString()
  const sessionDuration = time.getTime() - sessionStartUnix

  const defaultEventAttributes = {
    date: timeStamp,
    sessionId, // Event[id].Session.Id
    pageSession: pageSessionInfo.id,
  }

  const extraAttributes = enrichEventAttributes
    ? await enrichEventAttributes()
    : {}

  /* Format attributes */
  const eventAttributes = {
    ...defaultEventAttributes,
    ...extraAttributes,
    ...eventAttribs,
  }

  /* Format metrics */
  const userDefinedMetrics = data.metrics || {}

  const defaultMetrics = {
    /* Time of session */
    sessionTime: sessionData.elapsed || sessionDuration,
    /* Date metrics */
    hour: time.getHours(),
    day: time.getDay() + 1,
    month: time.getMonth() + 1,
    year: time.getFullYear(),
  }

  const extraMetrics = enrichEventMetrics ? await enrichEventMetrics() : {}

  const eventMetrics = {
    ...defaultMetrics,
    ...extraMetrics,
    ...userDefinedMetrics,
  }

  const preparedData = {
    attributes: await prepareAttributes(eventAttributes),
    metrics: await prepareMetrics(eventMetrics),
  }

  logger(`${eventId}:${type}`)
  logger('eventAttributes', preparedData.attributes)
  logger('eventMetrics', preparedData.metrics)

  const eventPayload = {
    [eventId]: {
      /* The name of the event */
      EventType: type,
      /* The date and time, in ISO 8601 format, when the event occurred. */
      Timestamp: timeStamp,
      /* The package name of the app that's recording the event. */
      AppPackageName: appPackageName,
      /* The title of the app that's recording the event. */
      AppTitle: appTitle,
      /* The version number of the app that's recording the event. Maps to application.version_code in kinesis stream */
      AppVersionCode: appVersionCode,
      /* Event attributes - One or more custom attributes that are associated with the event. */
      Attributes: preparedData.attributes,
      /* Event metrics - One or more custom metrics that are associated with the event. */
      Metrics: preparedData.metrics,
      Session: {
        /* SessionId is required */
        Id: sessionId,
        /* StartTimestamp is required */
        StartTimestamp: sessionStart, // ISOString
      },
    },
  }

  // Add session stop parameters.
  if (eventName === PINPOINT_EVENTS.SESSION_STOP) {
    eventPayload[eventId].Session.Duration = sessionDuration
    eventPayload[eventId].Session.StopTimestamp = timeStamp
  }

  return eventPayload
}

async function callAWS(eventsRequest, config) {
  const {
    pinpointRegion,
    pinpointAppId,
    lambdaArn,
    lambdaRegion,
    credentials,
    getCredentials,
    debug,
  } = config

  let creds = credentials
  /* Use custom creds function */
  if (!Object.keys(creds).length && getCredentials) {
    try {
      creds = await getCredentials()
    } catch (err) {
      throw new Error(err)
    }
  }

  const auth = {
    // Support amplify and raw client auth params
    accessKeyId: creds.accessKeyId || creds.AccessKeyId,
    secretAccessKey: creds.secretAccessKey || creds.SecretKey,
    sessionToken: creds.sessionToken || creds.SessionToken,
    retries: 5,
  }
  const pinpointClient = new AWS.PinpointClient({
    credentials: auth,
    region: pinpointRegion,
  })
  const lambda_region = lambdaRegion || pinpointRegion
  const pinpoint_region = pinpointRegion || lambdaRegion

  const fips = config.fips === true ? '-fips' : ''
  const LAMBDA_FN = `https://lambda.${lambda_region}.amazonaws.com/2015-03-31/functions/${lambdaArn}/invocations`
  const PINPOINT_URL = `https://pinpoint${fips}.${pinpoint_region}.amazonaws.com/v1/apps/${pinpointAppId}/events`
  const endpointUrl = lambdaArn ? LAMBDA_FN : PINPOINT_URL

  const payload = {
    body: JSON.stringify(eventsRequest),
  }

  const command = new AWS.PutEventsCommand({
    ApplicationId: pinpointAppId,
    EventsRequest: eventsRequest
  })
  const data = await pinpointClient.send(command)
  console.log(data, '******* response from client send *******')
  if (data && data.Results) {
    // Process api responses
    const responses = Object.keys(data.Results).map(
      (eventId) => data.Results[eventId]
    )

    responses.forEach((resp) => {
      const EndpointItemResponse = resp.EndpointItemResponse || {}
      const EventsItemResponse = resp.EventsItemResponse || {}
      if (Object.keys(EndpointItemResponse).length) {
        if (debug) {
          // console.log('EndpointItemResponse', EndpointItemResponse)
        }

        if (ACCEPTED_CODES.includes(EndpointItemResponse.StatusCode)) {
          // console.log('endpoint update success.')
        } else if (RETRYABLE_CODES.includes(EndpointItemResponse.StatusCode)) {
          // console.log('endpoint update failed retry')
        } else {
          // Try to handle error
          handleEndpointUpdateBadRequest(EndpointItemResponse, Endpoint)
        }
      }
      const events = Object.keys(EventsItemResponse)
      if (events.length) {
        if (debug) {
          // console.log('EventsResponse', EventsItemResponse)
          // console.log('original request', eventsRequest)
        }
        events.forEach((eventId) => {
          // @TODO handle 400 errors
          // console.log(`[req "${Endpoint.RequestId}"] Event id ${eventId}`, EventsItemResponse[eventId])
        })
      }
    })
  }
  return data
}

function formatPayload({ eventId, time, sessionId, sessionStart, properties, rest }) {
  return {
    eventId,
    sessionId,
    sessionStart,
    time,
    attributes: {
      ...properties,
      ...rest
    }
  }
}

function getPinpointConfig() {
  return {
    appTitle: 'clientName',
    appPackageName: 'clientName',
    appVersionCode: 'clientVersion',
    getEndpointId: () => '816d9486-d26f-43b9-a1a2-51b0eac28e5b',
    getUserId: () => 'userId',
  }
}

function handleEndpointUpdateBadRequest(error, endpoint) {
  const { StatusCode, Message } = error
  // console.log('message', Message)
  if (StatusCode === BAD_REQUEST_CODE) {
    // 400
    if (Message.startsWith('Missing ChannelType')) {
      throw new Error('Missing ChannelType')
    }
    if (Message.startsWith('Exceeded maximum endpoint per user count')) {
      throw new Error('Exceeded maximum endpoint per user count')
    }
  } else if (StatusCode === FORBIDDEN_CODE) {
    // Handle forbidden
  }
}

function generateEndpointData(eventPayload, pinpointConfig) {
  const { attributes } = eventPayload
  const { userId, platform, os, platformVersion, nodeVersion } = attributes
  const platformName = getPlatformNiceName(platform)  
  const demographicInfo = {
    AppVersion: '2.0.0',
    Make: 'Javascript',
    Model: 'NodeJS',
    ModelVersion: 'nodeVersion',
    Platform: 'platformName',
  }

  return {
    Attributes: {},
    Demographic: demographicInfo,
    ...(!userId) ? {} : { User: { UserId: userId } }
  }
}


function getAppVersionCode(config) {
  const appName = config.appTitle || config.appPackageName || ''
  const appVersion = config.appVersionCode || '0.0.0'
  return appName ? `${appName}@${appVersion}` : appVersion
}

let migrationRan = false
async function mergeEndpointData(endpoint = {}, config = {}) {
  const {
    getUserId,
    getEndpointId,
    enrichUserAttributes,
    endpointMigration,
  } = config
  const context = grabContext(config)
  const sessionKey = context.sessionKey ? context.sessionKey() : 'sessions'
  const pageKey = context.pageViewKey ? context.pageViewKey() : 'pageViews'

  const pageSessionInfo = getPageSession()
  const pageSession = pageSessionInfo.id
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
  const appVersionString = getAppVersionCode(config)

  let demographicInfo = {
    // AppTitle/0.0.0. Maps to application.version_name in kinesis stream
    AppVersion: appVersionString,
  }

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
  if (endpoint.User && endpoint.User.UserAttributes) {
    endpoint.User.UserAttributes = await prepareAttributes(
      endpoint.User.UserAttributes,
      true
    )
  }
  endpoint.Attributes = await prepareAttributes(endpoint.Attributes, true)
  endpoint.Metrics = await prepareMetrics(endpoint.Metrics)

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
    endpoint.Attributes.lastPageSession = [pageSession]
    // Store the endpoint data.
    return persistEndpoint(id, endpoint)
  }

  /* If current sessionId is different than lastSession */
  if (hasPreviousSession && hasPreviousSession[0] !== sessionData.id) {
    endpoint.Attributes.lastSessionDate = [sessionData.createdAt]
    endpoint.Attributes.lastSession = [sessionData.id]
    endpoint.Metrics[sessionKey] += 1.0
  }
  // Increment pageViews.
  if (endpoint.Attributes.lastPageSession[0] !== pageSession) {
    endpoint.Attributes.lastPageSession = [pageSession]
    endpoint.Metrics[pageKey] += 1.0
  }

  // Store the endpoint data.
  return persistEndpoint(id, endpoint)
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

/**
 * Resolves an attribute or metric value and sanitize it.
 *
 * @param {mixed} value
 * @param {Function} sanitizeCallback
 */
async function prepareData(value, sanitizeCallback) {
  if (typeof value === 'function') {
    value = await value()
  }
  return sanitizeCallback(value)
}

/**
 * Ensure value is a string or array of strings.
 *
 * @param {mixed} value
 */
function sanitizeAttribute(value) {
  // If null or undefined
  if (value == null) return
  if (Array.isArray(value)) {
    return value.filter(notEmpty).map((val) => val.toString())
  }
  // @TODO guard against null here
  return isNullOrUndef(value) ? value : value.toString()
}

function notEmpty(val) {
  return val !== null && typeof val !== 'undefined'
}

function isNullOrUndef(value) {
  return value == null
}

/**
 * Prepares an object for inclusion in endpoint data or event data.
 *
 * @param {Object} attributes
 * @param {Boolean} asArray If true ensure an array of strings is returned for each property
 */

export async function prepareAttributes(attributes, asArray = false) {
  const sanitized = {}
  for (const name in attributes) {
    const value = Array.isArray(attributes[name])
      ? attributes[name]
      : [attributes[name]]
    const prepValue = asArray ? value : value[0]
    // console.log(`name ${name}`, prepValue)
    const data = await prepareData(prepValue, sanitizeAttribute)
    /* Remove any null/undefined values */
    if (!isNullOrUndef(data)) {
      sanitized[name] = data
    }
  }
  return sanitized
}

/**
 * Ensure value is a single float.
 *
 * @param {mixed} value
 */
function sanitizeMetric(value) {
  return parseFloat(Number(Array.isArray(value) ? value[0] : value))
}

/**
 * Prepares an object for inclusion in endpoint data or event data.
 *
 * @param {Object} metrics
 */
export async function prepareMetrics(metrics) {
  const sanitized = {}
  for (const name in metrics) {
    sanitized[name] = await prepareData(metrics[name], sanitizeMetric)
  }
  return sanitized
}
