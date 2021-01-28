import deepmerge from 'deepmerge'
import { uuid } from 'analytics-utils'
import { AwsClient } from 'aws4fetch'
import { CHANNEL_TYPES, EVENTS } from './constants'
import getClientInfo from './client-info'

// TODO use beacon
// import 'navigator.sendbeacon'
const BEACON_SUPPORTED = typeof navigator !== 'undefined' && navigator && typeof navigator.sendBeacon === 'function'

const ENABLE_QUEUE = true
const SESSION_KEY = '__session_id'
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
	const configuration = {
		getContext: config.getContext || noOp,
		enrichEventAttributes: config.enrichEventAttributes || noOp,
		enrichEventMetrics: config.enrichEventMetrics || noOp,
		credentials: config.credentials || {},
		getEndpointId: config.getEndpointId,
		...config
	}

	// Create function that sends to pinpoint
	const sentDataToPinpoint = createSendEvents(configuration)

	// Create instance of record
	const recordEvent = makeRecordFunction({
		sentDataToPinpoint: sentDataToPinpoint,
		...configuration
	})

	/*
	const updateEndpoint = async function (endpoint = {}) {
		return sentDataToPinpoint(endpoint)
	}
	*/

	// Run initialize endpoint merge
	mergeEndpointData({}, configuration.getContext())

	// Flush remaining events on page close
	const detachWindowUnloadListener = onWindowUnload(recordEvent)

	// Function to detach listeners
	return {
		updateEndpoint: sentDataToPinpoint,
		recordEvent: recordEvent,
		disable: () => {
			detachWindowUnloadListener()
		}
	}
}

function onWindowUnload(recordFunc) {
	if (typeof window === 'undefined') {
		return noOp
	}

	const stopSessionHandler = stopSessionFactory(recordFunc)
	
	// Attach listener
	window.addEventListener('beforeunload', stopSessionHandler)
	return () => window.removeEventListener('beforeunload', stopSessionHandler)
}

function stopSessionFactory(recordFunc) {
	// Flush remaining events
	return () => {
		console.log('Fire stop session')
		recordFunc('_session.stop', false)
	}
}

function getSessionID() {
	if (typeof window.sessionStorage === 'undefined') {
		return null
	}

	// Get stored session.
	const sessionID = window.sessionStorage.getItem(SESSION_KEY)

	if (sessionID) {
		return sessionID
	}

	// Create and set a UUID.
	const newSessionID = uuid()
	window.sessionStorage.setItem(SESSION_KEY, newSessionID)
	return newSessionID
}

function getEndpoint() {
  try {
    return JSON.parse(localStorage.getItem(ENDPOINT_KEY)) || {}
  } catch (error) {
    return {}
  }
}

function setEndpoint(endpoint) {
  localStorage.setItem(ENDPOINT_KEY, JSON.stringify(endpoint))
}

function makeRecordFunction(config = {}) {
	let timer
	const { sentDataToPinpoint, appPackageName, appTitle, appVersionCode, debug } = config

  return async function recordEvent(type, data = {}, endpoint = {}, queue = true) {

    if (typeof data === 'boolean') {
      queue = data
      data = {}
    }
    if (typeof endpoint === 'boolean') {
      queue = endpoint
      endpoint = {}
    }

		const contextInfo = config.getContext()
		// console.log('contextInfo', contextInfo)
		const { pageSession, subSessionId, subSessionStart, elapsed } = contextInfo
    // Merge endpoint data.
    if (Object.entries(endpoint).length) {
      endpoint = await mergeEndpointData(endpoint, contextInfo)
    }
		
		const time = new Date()
		const userDefinedAttributes = data.attributes || {}
		
		const defaultEventAttributes = {
			date: time.toISOString(),
			session: getSessionID(),
			pageSession: pageSession,
			hash: window.location.hash,
			path: window.location.pathname,
			referrer: document.referrer,
			search: window.location.search,
			title: document.title,
			host: window.location.hostname,
			url: window.location.origin + window.location.pathname
		}

		const extraAttributes = await config.enrichEventAttributes()

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

		const extraMetrics = await config.enrichEventMetrics()

		const eventMetrics = {
			...defaultMetrics,
			...extraMetrics,
			...userDefinedMetrics,
		}
	
    const preparedData = {
      attributes: await prepareAttributes(eventAttributes),
      metrics: await prepareMetrics(eventMetrics),
    }

		const eventId = uuid()
    const timeStamp = new Date().toISOString()

		if (debug) {
			console.log(`${eventId}:${type}`)
			console.log('eventAttributes', preparedData.attributes)
			console.log('eventMetrics', preparedData.metrics)
		}

    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Pinpoint.html#putEvents-property
    const Event = {
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
    if (type === EVENTS.SESSION_STOP) {
      Event[eventId].Session.Duration = Date.now() - subSessionStart
      Event[eventId].Session.StopTimestamp = timeStamp
    }

    // Store sent events to queue
    EVENTS_QUEUE.push(Event)

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

    // Flush new events after 5 seconds.
    timer = setTimeout(sentDataToPinpoint, 5000)
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
			const contextInfo = config.getContext()
			endpointData = await mergeEndpointData(endpoint, contextInfo)
		} else {
			endpointData = getEndpoint() || {}
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
		const eventsRequest = {
			BatchItem: {
				[endpointId]: {
					Endpoint: Endpoint,
					Events: Events,
				},
			},
		}

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

async function callAWS(eventsRequest, config) {
		const { 
		pinpointRegion, 
		pinpointEndpoint,
		pinpointAppId,
		lambdaArn,
		lambdaRegion,
		credentials,
		getCredentials,
		debug
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
	/*
	console.log('credentials in plugin', creds)
	console.log('credentials.identityId', creds.identityId)
	/**/

	const aws = new AwsClient({
		// Support amplify and raw client auth params
		accessKeyId: creds.accessKeyId || creds.AccessKeyId,
		secretAccessKey: creds.secretAccessKey || creds.SecretKey,
		sessionToken: creds.sessionToken || creds.SessionToken,
	})
	const lambda_region = lambdaRegion || pinpointRegion
	const pinpoint_region = pinpointRegion || lambdaRegion
  const LAMBDA_FN = `https://lambda.${lambda_region}.amazonaws.com/2015-03-31/functions/${lambdaArn}/invocations`
	const PINPOINT_URL = `https://pinpoint.${pinpoint_region}.amazonaws.com/v1/apps/${pinpointAppId}/events`
	const endpointUrl = (lambdaArn) ? LAMBDA_FN : PINPOINT_URL
	const data = await aws.fetch(endpointUrl, {
		body: JSON.stringify(eventsRequest),
	}).then((d) => d.json())
	// console.log('pinpoint response', data)

	if (data && data.Results) {
		// Process api responses
		const responses = Object.keys(data.Results).map((eventId) => data.Results[eventId])

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
  if (StatusCode === BAD_REQUEST_CODE) { // 400
    if (Message.startsWith('Missing ChannelType')) {
      throw new Error('Missing ChannelType')
		}
    if (Message.startsWith('Exceeded maximum endpoint per user count')) {
      throw new Error('Exceeded maximum endpoint per user count')
		}
  } else if (StatusCode === FORBIDDEN_CODE) {

  }
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

async function mergeEndpointData(endpoint = {}, context = {}) {
	const persistedEndpoint = getEndpoint()
	const { pageSession } = context
  const defaultEndpointConfig = {};

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
		EndpointData.Attributes.DeviceMake = [ clientInfo.device.vendor ]
	}
	if (clientInfo.device && clientInfo.device.model) {
		EndpointData.Attributes.DeviceModel = [ clientInfo.device.model ]
	}
	if (clientInfo.device && clientInfo.device.type) {
		EndpointData.Attributes.DeviceType = [ clientInfo.device.type ]
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

	/* Format attributes and metrics. */
	if (endpoint.User && endpoint.User.UserAttributes) {
		endpoint.User.UserAttributes = await prepareAttributes(endpoint.User.UserAttributes, true)
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
		if (endpoint.Attributes.lastPageSession[0] !== pageSession) {
			endpoint.Attributes.lastPageSession = [pageSession]
			endpoint.Metrics[pageKey] += 1.0
		}
	}

	// Store the endpoint data.
	setEndpoint(endpoint)

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
  return Array.isArray(value) ? value.map(val => val.toString()) : value.toString()
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
 * @param {Object} attributes
 * @param {Boolean} asArray If true ensure an array of strings is returned for each property
 */

export async function prepareAttributes(attributes, asArray = false) {
	const sanitized = {}
	for ( const name in attributes ) {
		const value = Array.isArray(attributes[name]) ? attributes[name] : [attributes[name]]
		if (asArray) {
			sanitized[name] = await prepareData(value, sanitizeAttribute)
		} else {
			sanitized[name] = await prepareData(value[0], sanitizeAttribute)
		}
	}
	return sanitized
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