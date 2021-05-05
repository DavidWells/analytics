import deepmerge from 'deepmerge'
import { uuid } from 'analytics-utils'
import { AwsClient } from 'aws4fetch'
import getClientInfo from './client-info'
import getEventName from './get-event-name'
import { CHANNEL_TYPES } from './constants'
import * as PINPOINT_EVENTS from './events'
import inBrowser from '../utils/in-browser'

// TODO use beacon
// import 'navigator.sendbeacon'
const BEACON_SUPPORTED = typeof navigator !== 'undefined' && navigator && typeof navigator.sendBeacon === 'function'

const ENABLE_QUEUE = true
const ENDPOINT_KEY = '__endpoint'
const RETRYABLE_CODES = [429, 500]
const ACCEPTED_CODES = [202]
const FORBIDDEN_CODE = 403
const BAD_REQUEST_CODE = 400

const clientInfo = getClientInfo()

// TODO localize queue
let EVENTS_QUEUE = []

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
    console.log('Fire stop session')
    recordFunc(PINPOINT_EVENTS.SESSION_STOP, false)
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

function setEndpoint(id, endpointData) {
  const endpointKey = getStorageKey(id)
  const data =
    typeof endpointData === 'string'
      ? endpointData
      : JSON.stringify(endpointData)
  localStorage.setItem(endpointKey, data)
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

    const eventPayload = await formatEvent(eventName, data, config)

    // IF endpoint exists, & event is page view, update user attributes
    if (
      Object.entries(endpoint).length ||
      eventName === PINPOINT_EVENTS.PAGE_VIEW
    ) {
      endpoint = await mergeEndpointData(endpoint, config)
    }

    // Store sent events to queue
    EVENTS_QUEUE.push(eventPayload)

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

  return async function sentDataToPinpoint(endpoint = {}) {
    // console.log(`flushEvents called ${counter++} EVENTS_QUEUE.length ${EVENTS_QUEUE.length}`)
    if (!EVENTS_QUEUE.length && !Object.keys(endpoint).length) {
      if (debug) console.log('No events, return early')
      return
    }
    // console.log('aws', aws)

    let endpointData = endpoint

    // Events are associated with an endpoint.
    const endpointId = await getEndpointId()
    if (debug) {
      console.log('resolved endpointId', endpointId)
    }

    if (!endpointId) {
      console.error('No User ID found. Call Auth()')
      return
    }

    // Update endpoint data if provided.
    if (Object.entries(endpoint).length) {
      endpointData = await mergeEndpointData(endpoint, config)
    } else {
      endpointData = getEndpoint(endpointId) || {}
    }

    if (debug) {
      console.log('endpointData', endpointData)
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
      console.log('CHANNEL_TYPE', channelType)
    }

    // Reduce events to an object keyed by event ID.
    const Events = EVENTS_QUEUE.reduce((acc, event) => {
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
      // https://docs.aws.amazon.com/pinpoint/latest/apireference/apps-application-id-endpoints.html#apps-application-id-endpoints-properties
      // Default OptOut is ALL
      // OptOut: 'NONE',
      Endpoint.OptOut = endpointData.OptOut || 'NONE'
    }

    // const endpointId = endpointId.replace(`${COGNITO_REGION}:`, '' )
    // Build events request object.
    const eventsRequest = formatPinpointBody(endpointId, Endpoint, Events)

    try {
      /*
			console.log('Call pinpoint', EventsRequest)
			console.log('EVENTS', Object.keys(Events).reduce((acc, e) => {
				acc = acc.concat(Events[e].EventType)
				return acc
			}, []))
			console.log('Metrics', Endpoint.Metrics)
			/**/
      const data = await callAWS(eventsRequest, config)
      // console.log('data', data)
    } catch (err) {
      console.log('callPinPoint err', err)
    }
    // console.log('Before', EVENTS_QUEUE)
    /* Purge queue */
    EVENTS_QUEUE = []
    // console.log('After', EVENTS_QUEUE)
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
    getSessionID,
    enrichEventAttributes,
    enrichEventMetrics,
    debug,
  } = config
  const type = getEventName(eventName, eventMapping)
  const contextInfo = grabContext(config)
	
  // console.log('contextInfo', contextInfo)
  const { pageSession, subSessionId, subSessionStart, elapsed } = contextInfo

  const userDefinedAttributes = data.attributes || {}
  const eventId = data.eventId || uuid()
  const time = (data.time) ? new Date(data.time) : new Date()
  const timeStamp = time.toISOString()
	let sessionId
	if (data.sessionId) {
		sessionId = data.sessionId
	} else if (typeof getSessionID === 'function') {
		sessionId = getSessionID()
	} else {
		sessionId = uuid()
	}

  const defaultEventAttributes = {
    date: timeStamp,
    session: sessionId,
    ...(pageSession) ? { pageSession: pageSession } : {}
  }

  const extraAttributes = await enrichEventAttributes()

  /* Format attributes */
  const eventAttributes = {
    ...defaultEventAttributes,
    ...extraAttributes,
    /* Query params */
    // TODO add ...queryParams,
    ...userDefinedAttributes,
  }

  /* Format metrics */
  const elapsedSessionTime = elapsed + (time.getTime() - subSessionStart)
  const userDefinedMetrics = data.metrics || {}

  const defaultMetrics = {
    /* Time of session */
    sessionTime: elapsedSessionTime,
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

  if (debug) {
    console.log(`${eventId}:${type}`)
    console.log('eventAttributes', preparedData.attributes)
    console.log('eventMetrics', preparedData.metrics)
  }

  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Pinpoint.html#putEvents-property
  const eventPayload = {
    [eventId]: {
      EventType: type,
      Timestamp: timeStamp,
      AppPackageName: appPackageName,
      AppTitle: appTitle,
      AppVersionCode: appVersionCode,
      /* Event attributes */
      Attributes: preparedData.attributes,
      /* Event metrics */
      Metrics: preparedData.metrics,
      Session: {
        /* SessionId is required */
        Id: subSessionId,
        /* StartTimestamp is required */
        StartTimestamp: new Date(subSessionStart).toISOString(),
      },
    },
    /*"client_context": {
			"custom": {
				"tester": "{\"he\":\"there\"}"
			}
		}*/
  }

  // Add session stop parameters.
  if (eventName === PINPOINT_EVENTS.SESSION_STOP) {
    eventPayload[eventId].Session.Duration = Date.now() - subSessionStart
    eventPayload[eventId].Session.StopTimestamp = timeStamp
  }

  return eventPayload
}

async function callAWS(eventsRequest, config) {
  const {
    pinpointRegion,
    pinpointEndpoint,
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

  const data = await aws
    .fetch(endpointUrl, {
      body: JSON.stringify(eventsRequest),
    })
    .then((d) => d.json())
  // console.log('pinpoint response', data)

  if (data && data.Results) {
    // Process api responses
    const responses = Object.keys(data.Results).map(
      (eventId) => data.Results[eventId]
    )

    responses.forEach((resp) => {
      const EndpointItemResponse = resp.EndpointItemResponse || {}
      const EventsItemResponse = resp.EventsItemResponse || {}
      if (Object.keys(EndpointItemResponse).length) {
        if (debug) console.log('EndpointItemResponse', EndpointItemResponse)

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
        if (debug) console.log('EventsResponse', EventsItemResponse)
        events.forEach((eventId) => {
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

let migrationRan = false
async function mergeEndpointData(endpoint = {}, config = {}) {
  const { getUserId, getEndpointId, getSessionID } = config
  const context = grabContext(config)
  const id = await getEndpointId()
  // @TODO remove in next version
  if (!migrationRan) {
    migrationRan = true
    // Backwards compatible endpoint info
    const deprecatedData = localStorage.getItem(ENDPOINT_KEY)
    // clear out old key value
    if (deprecatedData) {
      setEndpoint(id, deprecatedData)
      // remove old key
      localStorage.removeItem(ENDPOINT_KEY)
    }
  }

  const persistedEndpoint = getEndpoint(id)
  const { pageSession } = context
  const defaultEndpointConfig = {}

  const demographicByClientInfo = {
    AppVersion: clientInfo.appVersion,
    Make: clientInfo.make,
    Model: clientInfo.model,
    ModelVersion: clientInfo.version,
    Platform: clientInfo.platform,
    Locale: clientInfo.language,
  }

  const EndpointData = {
    Attributes: {},
    Demographic: {
      AppVersion: clientInfo.appVersion || '',
      ...demographicByClientInfo,
      ...defaultEndpointConfig.demographic,
      // ...event.demographic, // event override
    },
    Location: {},
    Metrics: {},
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

  /* Add demographic data to endpoint */
  if (clientInfo.engine && clientInfo.engine.name) {
    EndpointData.Demographic.Make = clientInfo.engine.name
  }
  if (clientInfo.browser && clientInfo.browser.name) {
    EndpointData.Demographic.Model = clientInfo.browser.name
  }
  if (clientInfo.browser && clientInfo.browser.version) {
    EndpointData.Demographic.ModelVersion = clientInfo.browser.version
  }
  if (clientInfo.os && clientInfo.os.name) {
    EndpointData.Demographic.Platform = clientInfo.os.name
  }
  if (clientInfo.os && clientInfo.os.version) {
    EndpointData.Demographic.PlatformVersion = clientInfo.os.version
  }

  /*
  if (endpoint.channelType && clientInfo.os.version) {
    EndpointData.ChannelType = endpoint.channelType
  }
  */

  // Merge new endpoint data with defaults.
  endpoint = deepmerge.all([EndpointData, persistedEndpoint, endpoint], {
    // TODO maybe change array merge
    arrayMerge: overwriteMerge,
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
      if (!endpoint.User) endpoint.User = {}
      endpoint.User.UserId = foundId
    }
  }

  /* Format attributes and metrics. */
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

  let sessionKey = 'sessions'
  if (context.sessionKey) {
    sessionKey = context.sessionKey()
  }
  let pageKey = 'pageViews'
  if (context.pageViewKey) {
    pageKey = context.pageViewKey()
  }
  // Add session and page view counts to endpoint.
  if (!endpoint.Attributes.lastSession) {
    endpoint.Attributes.lastSession = [getSessionID()]
    endpoint.Attributes.lastPageSession = [pageSession]
    endpoint.Metrics[sessionKey] = 1.0
    endpoint.Metrics[pageKey] = 1.0
  } else {
    // Increment sessions.
    if (endpoint.Attributes.lastSession[0] !== getSessionID()) {
      endpoint.Attributes.lastSession = [getSessionID()]
      endpoint.Metrics[sessionKey] += 1.0
    }
    // Increment pageViews.
    // console.log('[pageViews] lastPageSession', endpoint.Attributes.lastPageSession[0])
    // console.log('[pageViews] pageSession', pageSession)
    if (endpoint.Attributes.lastPageSession[0] !== pageSession) {
      endpoint.Attributes.lastPageSession = [pageSession]
      endpoint.Metrics[pageKey] += 1.0
      // console.log('[pageViews] Its different increment page views. New Count', endpoint.Metrics[pageKey])
    }
  }

  // Store the endpoint data.
  setEndpoint(id, endpoint)

  return endpoint
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
  return Array.isArray(value)
    ? value.map((val) => val.toString())
    : value.toString()
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
    if (asArray) {
      sanitized[name] = await prepareData(value, sanitizeAttribute)
    } else {
      sanitized[name] = await prepareData(value[0], sanitizeAttribute)
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

	const serviceInfo = { region, service: MOBILE_SERVICE_NAME };

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
