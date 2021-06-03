import deepmerge from 'deepmerge'
import { uuid } from 'analytics-utils'
import { AwsClient } from 'aws4fetch'
import {
  getSession,
  getTabSession,
  setTabSession,
  getPageSession, 
  setPageSession,
} from '@analytics/session-utils'
import getClientInfo from '../utils/client-info'
import getEventName from './get-event-name'
import { CHANNEL_TYPES } from './constants'
import * as PINPOINT_EVENTS from './events'
import inBrowser from '../utils/in-browser'

const { SESSION_START, SESSION_STOP } =PINPOINT_EVENTS
// TODO use beacon
// import 'navigator.sendbeacon'
const BEACON_SUPPORTED = typeof navigator !== 'undefined' && navigator && typeof navigator.sendBeacon === 'function'

const ENABLE_QUEUE = true
const ENDPOINT_KEY = '__endpoint'
const RETRYABLE_CODES = [429, 500]
const ACCEPTED_CODES = [202]
const FORBIDDEN_CODE = 403
const BAD_REQUEST_CODE = 400


// TODO localize queue
let EVENTS_QUEUE = []
const clientInfo = getClientInfo()

function noOp() {
  return {}
}

const EMAIL_REGEX = /.+\@.+\..+/
function isEmail(string) {
  return EMAIL_REGEX.test(string)
}

export { ENDPOINT_KEY }

export function initialize(config = {}) {
  // @TODO clean up
  const configuration = {
    getContext: config.getContext || noOp,
    enrichEventAttributes: config.enrichEventAttributes || noOp,
    enrichEventMetrics: config.enrichEventMetrics || noOp,
    credentials: config.credentials || {},
    getEndpointId: config.getEndpointId,
    ...config,
  }

  // Create function that sends to pinpoint
  const sentDataToPinpoint = createSendEvents(configuration)

  // Create instance of record
  const recordEvent = makeRecordFunction({
    sentDataToPinpoint: sentDataToPinpoint,
    ...configuration,
  })

  // Run initialize endpoint merge
  mergeEndpointData({}, config)

  // Flush remaining events on page close
  const detachWindowUnloadListener = onWindowUnload(recordEvent)

  // Function to detach listeners
  return {
    updateEndpoint: sentDataToPinpoint,
    recordEvent: recordEvent,
    disable: () => {
      detachWindowUnloadListener()
    },
  }
}

function onWindowUnload(recordFunc) {
  if (!inBrowser) {
    return noOp
  }
  const stopSessionHandler = stopSessionFactory(recordFunc)
  window.addEventListener('beforeunload', stopSessionHandler)
  return () => window.removeEventListener('beforeunload', stopSessionHandler)
}

function stopSessionFactory(recordFunc) {
  // Flush remaining events
  return () => {
    // console.log('Fire stop session')
    recordFunc(SESSION_STOP, false)
  }
}

export function getStorageKey(id) {
  return `${ENDPOINT_KEY}.${id}`
}

function getEndpoint(id) {
  let endpointInfo = {}
  try {
    endpointInfo = JSON.parse(localStorage.getItem(getStorageKey(id))) || {}
  } catch (error) {}
  return endpointInfo
}

function persistEndpoint(id, endpointData) {
  const endpointKey = getStorageKey(id)
  const data = typeof endpointData === 'string' ? endpointData  : JSON.stringify(endpointData)
  localStorage.setItem(endpointKey, data)
  return endpointData
}

function makeRecordFunction(config = {}) {
  let timer
  const { sentDataToPinpoint } = config

  return async function recordEvent(
    eventName,
    data = {},
    endpoint = {},
    queue = true
  ) {
    if (typeof data === 'boolean') {
      queue = data
      data = {}
    }
    if (typeof endpoint === 'boolean') {
      queue = endpoint
      endpoint = {}
    }
    // const cleanEventName = getEventName(eventName, config.eventMapping)
    // console.log('> cleanEventName', cleanEventName)
    // console.log('> eventName', eventName)
    const eventPayload = await formatEvent(eventName, data, config)

    // IF endpoint exists, & event is page view, update user attributes
    if (Object.entries(endpoint).length || eventName === PINPOINT_EVENTS.PAGE_VIEW) {
      endpoint = await mergeEndpointData(endpoint, config)
    }

    // Store sent events to queue
    EVENTS_QUEUE.push(eventPayload)

    // @TODO if eventPayload. PINPOINT_EVENTS.SESSION_STOP

    // If config setting to send every event as it happens
    if (!ENABLE_QUEUE) {
      // console.log('Flush event immediately via option', Event)
      // @TODO make flushEvents into immediate trigger
      // return sendEvents(Event)
      return sentDataToPinpoint()
    }

    // Flush the events if we don't want to queue.
    if (!queue) {
      // console.log('Flush event immediately', Event)
      return sentDataToPinpoint()
    }

    if (timer) {
      clearTimeout(timer)
    }

    // Flush new events after 3 seconds.
    timer = setTimeout(sentDataToPinpoint, 3000)
  }
}

function createSendEvents(config = {}) {
  const { getEndpointId, debug } = config

  return async function sentDataToPinpoint(endpoint = {}, clearQueue = true) {
    // console.log(`flushEvents called ${counter++} EVENTS_QUEUE.length ${EVENTS_QUEUE.length}`)
    if (!EVENTS_QUEUE.length && !Object.keys(endpoint).length) {
      if (debug) console.log('No events, return early')
      return
    }
    // console.log('aws', aws)

    let endpointData = endpoint

    // Events are associated with an endpoint.
    const endpointId = await getEndpointId()
    // console.log('resolved endpointId', endpointId)

    if (!endpointId) {
      console.error('No endpointId found. check getEndpointId()')
      return
    }

    // Update endpoint data if provided.
    if (Object.entries(endpoint).length) {
      endpointData = await mergeEndpointData(endpoint, config)
    } else {
      endpointData = getEndpoint(endpointId) || {}
    }

    let channelType = endpointData.ChannelType
    // If email is set, set email channel
    if (endpointData.Address && isEmail(endpointData.Address)) {
      channelType = CHANNEL_TYPES.EMAIL
    } 

    if (!channelType && endpointData.Address) {
      if (clientInfo.platform === 'android') {
        channelType = channelType || CHANNEL_TYPES.GCM
      } else {
        channelType = channelType || CHANNEL_TYPES.APNS
      }
    }

    if (debug) {
      console.log('endpointData', endpointData)
      if (channelType) console.log('CHANNEL_TYPE', channelType)
    }
    
    // Reduce events to an object keyed by event ID.
    const Events = EVENTS_QUEUE.sort((a, b) => {
      const eventA = a.EventType
      const eventB = b.EventType
      // Send SESSION_START to front
      if (eventA == SESSION_START) return -1
      if (eventB == SESSION_START) return 1
      // Send SESSION_STOP to back
      if (eventA == SESSION_STOP) return 1
      if (eventB == SESSION_STOP) return -1
      return
    }).reduce((acc, event) => {
      return {
        ...event,
        ...acc,
      }
    }, {})
    /*
		console.log('────────sentDataToPinpoint───────────')
		console.log(Events)
		console.log('───────End sentDataToPinpoint────────')
		/**/

    // Build endpoint data.
    const Endpoint = endpointData
    Endpoint.RequestId = uuid()
    Endpoint.ChannelType = channelType

    if (Endpoint.Address) {
      // https://amzn.to/3bYC5gp
      // Default OptOut is ALL
      // OptOut: 'NONE',
      Endpoint.OptOut = endpointData.OptOut || 'NONE'
    }

    // const endpointId = endpointId.replace(`${COGNITO_REGION}:`, '' )
    // Build events request object.
    const eventsRequest = formatPinpointBody(endpointId, Endpoint, Events)

    /*
    console.log('Call pinpoint', EventsRequest)
    console.log('EVENTS', Object.keys(Events).reduce((acc, e) => {
      acc = acc.concat(Events[e].EventType)
      return acc
    }, []))
    console.log('Metrics', Endpoint.Metrics)
    /**/

    try {
      const awsResponse = await callAWS(eventsRequest, config)
      // console.log('awsResponse', awsResponse)
    } catch (err) {
      console.log('Error calling AWS', err)
    }
    /* Purge queue */
    // Temp fix for race condition of identify & track removing unprocessed events
    // @TODO use proper queue semantics
    if (clearQueue) {
      EVENTS_QUEUE = []
    } else {
      if (debug) {
        console.log('Skip queue clear')
      }
    }
    return endpointData
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
  const logger = (debug) ? console.log : () => {}
  const type = getEventName(eventName, eventMapping)
  const pageSessionInfo = getPageSession()
  const tabSessionData = getTabSession()
  const sessionData = getSession()
  logger('event pageSessionInfo', JSON.stringify(pageSessionInfo))
  logger('event tabSessionData ', JSON.stringify(tabSessionData))
  logger('event sessionData    ', JSON.stringify(sessionData))

  const eventAttribs = data.attributes || {}
  const eventId = data.eventId || uuid()
  const time = (data.time) ? new Date(data.time) : new Date()
  const timeStamp = time.toISOString()

  const defaultEventAttributes = {
    date: timeStamp,
    sessionId: sessionData.id, // Event[id].Session.Id 
    pageSession: pageSessionInfo.id
  }

  const extraAttributes = await enrichEventAttributes()

  /* Format attributes */
  const eventAttributes = {
    ...defaultEventAttributes,
    ...extraAttributes,
    /* Query params */
    // TODO add ...queryParams,
    ...eventAttribs,
  }

  /* Format metrics */
  // const elapsedSessionTime = elapsed + (time.getTime() - subSessionStart)
  const userDefinedMetrics = data.metrics || {}

  const defaultMetrics = {
    /* Time of session */
    sessionTime: sessionData.elapsed,
    /* Date metrics */
    hour: time.getHours(),
    day: time.getDay() + 1,
    month: time.getMonth() + 1,
    year: time.getFullYear(),
  }

  const extraMetrics = await enrichEventMetrics()

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
  logger('clientInfo', clientInfo)

  const appVersionCodeString = getAppVersionCode(config)
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Pinpoint.html#putEvents-property
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
      /* The version of the SDK that's running on the client device. */
      // ClientSdkVersion: 'STRING_VALUE',
      /* The name of the SDK that's being used to record the event. */
      // SdkName: 'STRING_VALUE',
      /* Event metrics - One or more custom metrics that are associated with the event. */
      Metrics: preparedData.metrics,
      Session: {
        /* SessionId is required */
        Id: sessionData.id,
        /* StartTimestamp is required */
        StartTimestamp: sessionData.createdAt, // old  new Date(subSessionStart).toISOString()
      },
    },
  }

  // Add session stop parameters.
  if (eventName === PINPOINT_EVENTS.SESSION_STOP) {
    // eventPayload[eventId].Session.Duration = Date.now() - subSessionStart
    // console.log('Old DURATION', Date.now() - subSessionStart)
    eventPayload[eventId].Session.Duration = time.getTime() - sessionData.created
    // sessionData.elapsed was slightly off
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
  // console.log('credentials', creds)

  const aws = new AwsClient({
    // Support amplify and raw client auth params
    accessKeyId: creds.accessKeyId || creds.AccessKeyId,
    secretAccessKey: creds.secretAccessKey || creds.SecretKey,
    sessionToken: creds.sessionToken || creds.SessionToken,
    retries: 5,
  })

  const lambda_region = lambdaRegion || pinpointRegion
  const pinpoint_region = pinpointRegion || lambdaRegion
  const fips = config.fips === true ? '-fips' : ''
  const LAMBDA_FN = `https://lambda.${lambda_region}.amazonaws.com/2015-03-31/functions/${lambdaArn}/invocations`
  const PINPOINT_URL = `https://pinpoint${fips}.${pinpoint_region}.amazonaws.com/v1/apps/${pinpointAppId}/events`
  const endpointUrl = lambdaArn ? LAMBDA_FN : PINPOINT_URL

  const payload = {
    body: JSON.stringify(eventsRequest)
  }
  const data = await aws.fetch(endpointUrl, payload).then((d) => d.json())
  // console.log('pinpoint response', data)

  if (data && data.Results) {
    // Process api responses
    const responses = Object.keys(data.Results).map((eventId) => data.Results[eventId])

    /*
    Message: "Session duration in milliseconds must be equal to the difference of start and stop timestamp"
    StatusCode: 400
    Session: {Id: "c024eae8-4978-4d2b-898d-31b89ddd62d3", StartTimestamp: "2021-05-25T06:09:30.632Z", Duration: 20008, StopTimestamp: "2021-05-25T06:09:50.641Z"}
    // new Date('2021-05-25T06:09:50.641Z').getTime() - new Date('2021-05-25T06:09:30.632Z').getTime() === 20009
    */

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

function getAppVersionCode(config) {
  const appName = config.appTitle || config.appPackageName || ''
  const appVersion = config.appVersionCode || '0.0.0'
  return (appName) ? `${appName}@${appVersion}` : appVersion
}

let migrationRan = false
const defaultFunc = (val) => val

async function mergeEndpointData(endpoint = {}, config = {}) {
  const { getUserId, getEndpointId, enrichUserAttributes, endpointMigration } = config
  const enrichUserFunc = enrichUserAttributes || defaultFunc
  const context = grabContext(config)
  const sessionKey = (context.sessionKey) ? context.sessionKey() : 'sessions'
  const pageKey = (context.pageViewKey) ? context.pageViewKey() : 'pageViews'

  // const tabSessionInfo = getTabSession()
  const pageSessionInfo = getPageSession()
  const pageSession = pageSessionInfo.id
  const sessionData = getSession()

  const id = await getEndpointId()

  // @TODO remove in next version
  if (!migrationRan) {
    migrationRan = true
    // Backwards compatible endpoint info
    const deprecatedData = localStorage.getItem(ENDPOINT_KEY)
    // clear out old key value
    if (deprecatedData) {
      persistEndpoint(id, deprecatedData)
      // remove old key
      localStorage.removeItem(ENDPOINT_KEY)
    }
  }

  const persistedEndpoint = getEndpoint(id)

  const browserVersion = [clientInfo.model, clientInfo.version].join('/')
  const appVersionString = getAppVersionCode(config)
  
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
    // 91.0.0
    ModelVersion: clientInfo.version,

    Platform: clientInfo.os.name || clientInfo.platform,
    // PlatformVersion: browserVersion,
    // Timezone: 'STRING_VALUE'
  }

  if (clientInfo.os && clientInfo.os.version) {
    demographicInfo.PlatformVersion = clientInfo.os.version
  }
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

  // Merge new endpoint data with defaults.
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
  // const tester = await prepareAttributes(enrichedAttributes, true)
  // console.log('tester', tester)
  if (endpoint.User && endpoint.User.UserAttributes) {
    endpoint.User.UserAttributes = await prepareAttributes(endpoint.User.UserAttributes, true)
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
    endpoint.Attributes.lastSessionDate = [ sessionData.createdAt ]
    endpoint.Attributes.lastSession = [ sessionData.id ]
    // @TODO persist tab info
    // endpoint.Attributes.lastTabSession = [ tabSessionInfo.id ]
    endpoint.Attributes.lastPageSession = [ pageSession ]
    // Store the endpoint data.
    // console.log('Set initital endpoint info')
    return persistEndpoint(id, endpoint)
  }
  
  /* If current sessionId is different than lastSession */
  if (hasPreviousSession && hasPreviousSession[0] !== sessionData.id) {
    endpoint.Attributes.lastSessionDate = [ sessionData.createdAt ]
    endpoint.Attributes.lastSession = [ sessionData.id ]
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

/**
 * Array merge function for deepmerge.
 *
 * @param {Array} destinationArray
 * @param {Array} sourceArray
 */

function overwriteMerge(_destinationArray, sourceArray) {
  return sourceArray
}

function grabContext(config) {
  if (typeof config.getContext === 'function') {
    return config.getContext()
  }
  return config.getContext
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
  return (isNullOrUndef(value)) ? value : value.toString()
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
    const value = Array.isArray(attributes[name]) ? attributes[name] : [attributes[name]]
    const prepValue = (asArray) ? value : value[0]
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

/* TODO wire up beacon
function sendBeaconRequest() {
	const eventParams = this._generateBatchItemContext(params);

	const { region } = this._config;
	const { ApplicationId, EventsRequest } = eventParams;

	const accessInfo = {
		secret_key: this._config.credentials.secretAccessKey,
		access_key: this._config.credentials.accessKeyId,
		session_token: this._config.credentials.sessionToken,
	};

	const url = `https://pinpoint.${region}.amazonaws.com/v1/apps/${ApplicationId}/events/legacy`;
	const body = JSON.stringify(EventsRequest);
	const method = 'POST';

	const request = {
		url,
		body,
		method,
	};

	const serviceInfo = { region, service: 'mobiletargeting' };

	const requestUrl = Signer.signUrl(
		request,
		accessInfo,
		serviceInfo,
		null
	);

	const success = navigator.sendBeacon(requestUrl, body);

	if (success) {
		return console.log('sendBeacon success');
	}
	return console.log('sendBeacon failure');
}
*/

/* usage
updateEndpoint({
  "Address": 'test@gmail.com',
  "Attributes": { "lol": ['thing'], baz: 'bar' },
  "Demographic": {
    "AppVersion": string,
    "Locale": string,
    "Make": string,
    "Model": string,
    "ModelVersion": string,
    "Platform": string,
    "PlatformVersion": string,
    "Timezone": string
  },
  "Location": {
    "City": string,
    "Country": string,
    "Latitude": number,
    "Longitude": number,
    "PostalCode": string,
    "Region": string
  },
  "Metrics": { "key": 1 },
  "OptOut": 'NONE',
  "User": {
    "UserAttributes": { "key": 'baz', 'waht': ['chill'] },
    "UserId": 'user-123'
  }
})

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
