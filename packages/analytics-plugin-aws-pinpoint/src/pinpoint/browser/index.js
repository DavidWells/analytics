import { uuid } from 'analytics-utils'
import { AwsClient } from 'aws4fetch'
// import { Signer } from './signer/amplify'
import smartQueue from '@analytics/queue-utils'
import { setItem, getItem, removeItem } from '@analytics/localstorage-utils'

import getClientInfo from '../../utils/client-info'
import createEventQueue from '../create-event-queue'
import { CHANNEL_TYPES } from '../constants'
import * as PINPOINT_EVENTS from '../events'
import inBrowser from '../../utils/in-browser'

const { SESSION_START, SESSION_STOP } =PINPOINT_EVENTS

const ENDPOINT_KEY = '__endpoint'
const RETRYABLE_CODES = [429, 500]
const ACCEPTED_CODES = [202]
const FORBIDDEN_CODE = 403
const BAD_REQUEST_CODE = 400

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
    credentials: config.credentials || {},
    getEndpointId: config.getEndpointId,
    ...config,
  }

  const logger = (configuration.debug) ? console.log : () => {}

  // Create function that sends to pinpoint
  const pinpointPutEvent = createPinpointSender(configuration)

  const queue = smartQueue(async (events, rest) => {
    events.forEach((event) => logger('>>>>> PROCESS queue', event))
    const response = await pinpointPutEvent(events, {})
    logger('>>>>> PROCESS queue response', response)
  }, {
    max: 10, // limit... event limit is 100 for pinpoint
    interval: 3000, // 3s
    throttle: true, // Ensure only max is processed at interval
    // onPause: (queue) => {},
    // onEmpty: () => {}
  })

  /* Create instance of recordEvent queue */
  const queueEvent = createEventQueue(queue, configuration)

  /* Run initialize endpoint merge */
  mergeEndpointData({}, config)

  // Flush remaining events on page close
  const detachUnloadListener = onWindowUnload(queueEvent)
  
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

function onWindowUnload(queueEvent) {
  if (!inBrowser) {
    return noOp
  }
  const stopSessionHandler = stopSessionFactory(queueEvent)
  window.addEventListener('beforeunload', stopSessionHandler)
  return () => window.removeEventListener('beforeunload', stopSessionHandler)
}

function stopSessionFactory(queueEvent) {
  // Flush remaining events
  return () => {
    queueEvent(SESSION_STOP, true)
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

function sortEvents(events) {
  return events.sort((a, b) => {
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
    
    const hasEndpoint = typeof endpointInfo === 'object' && Object.keys(endpointInfo).length
    const endpoint = (!hasEndpoint) ? getEndpoint(id) : await mergeEndpointData(endpointInfo, config)

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
      // Default OptOut is ALL
      // OptOut: 'NONE',
      endpoint.OptOut = endpoint.OptOut || 'NONE'
    }

    // const endpointId = endpointId.replace(`${COGNITO_REGION}:`, '' )
    // Build events request object.
    const events = sortEvents(eventsArray)
    const eventsRequest = formatPinpointBody(id, endpoint, events)
    // console.log('New eventsRequest', eventsRequest)

    let response
    let error
    try {
      response = await callAWS(eventsRequest, config)
      // console.log('awsResponse', response)
    } catch (err) {
      console.log('Error calling AWS', err)
      error = err
    }
    return {
      endpoint,
      response,
      error: error,
      events: eventsArray
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

  const auth = {
    // Support amplify and raw client auth params
    accessKeyId: creds.accessKeyId || creds.AccessKeyId,
    secretAccessKey: creds.secretAccessKey || creds.SecretKey,
    sessionToken: creds.sessionToken || creds.SessionToken,
    retries: 5,
  }
  const aws = new AwsClient(auth)
  const lambda_region = lambdaRegion || pinpointRegion
  const pinpoint_region = pinpointRegion || lambdaRegion

  const fips = config.fips === true ? '-fips' : ''
  const LAMBDA_FN = `https://lambda.${lambda_region}.amazonaws.com/2015-03-31/functions/${lambdaArn}/invocations`
  const PINPOINT_URL = `https://pinpoint${fips}.${pinpoint_region}.amazonaws.com/v1/apps/${pinpointAppId}/events`
  const endpointUrl = lambdaArn ? LAMBDA_FN : PINPOINT_URL

  /* @TODO get beacon working with APPI gateway/lambda/pinpoint legacy endpoint
  function testBeacon() {
    return () => {
      sendBeaconRequest({
        credentials: auth,
        region: pinpoint_region,
        pinpointAppId: pinpointAppId,
        eventsRequest: eventsRequest,
        // url: `https://pinpoint.${region}.amazonaws.com/v1/apps/${pinpointAppId}/events/legacy`;
        url: LAMBDA_FN
      })
    }
  }
  window.testBeacon = testBeacon
  /**/

  const payload = {
    body: JSON.stringify(eventsRequest)
  }
  const data = await aws.fetch(endpointUrl, payload).then((d) => d.json())
  // console.log('pinpoint response', data)

  if (data && data.Results) {
    // Process api responses
    const responses = Object.keys(data.Results).map((eventId) => data.Results[eventId])
    /* Message: "Session duration in milliseconds must be equal to the difference of start and stop timestamp"
    StatusCode: 400
    Session: {Id: "c024eae8-4978-4d2b-898d-31b89ddd62d3", StartTimestamp: "2021-05-25T06:09:30.632Z", Duration: 20008, StopTimestamp: "2021-05-25T06:09:50.641Z"}
    // new Date('2021-05-25T06:09:50.641Z').getTime() - new Date('2021-05-25T06:09:30.632Z').getTime() === 20009 */
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

/* @TODO wire up beacon */
/* mints URL like
https://pinpoint.us-east-1.amazonaws.com/v1/apps/undefined/events/legacy?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA5MJCKUDEZ7LNOGEQ%2F20210603%2Fus-east-1%2Fmobiletargeting%2Faws4_request&X-Amz-Date=20210603T072400Z&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEAaCXVzLWVhc3QtMSJHMEUCIDXqsRUHXcYO7evSAbFndvriZLwsjgWE1K589Ls2VsjwAiEAyrwV8L9j44pSMnoPTctYI824WVMXq7sl%2BGe%2FtesfoNIqmgYI6f%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw5MTk3MzE4NzE5NDUiDIahpd6Ez5lb38TwgCruBWM0LneAkgxPXtb%2B88hoXqpOyrLCWtuNiIBYyvpmfYTbOO%2Bw8JjmH9BVDcVdc2dyvzU4iFT4eX0tsRnJzKGzu6pdyYrGsj5H5vJgNw9muSKBXkEEv95OBTQHsC09kWayC4gNdeVbVzaSonwAtWln7VNT1SvdhT8UFCmm7xoBu1nYdwH49AF%2FHOC8PL69swK4pKzg3OQF5ioL%2B70%2FD1HHU51JD%2Bq5vNsupFZbgSqObopq52PM1FEs%2FlnsnbA8JdIe2IxZYKlz6Y6kL6evz3t5YlERTfI%2FG6jRAaTq0kl7OxQyCTqCb4JVfFFD%2BjVksFcOTyezgPhCcAsVqV0BPVZoeiv%2BysSlSjsiKKAUWHvH6GeUD5HtOT304%2F%2F2vT5I01tG0jHuAE%2BCvX5hm2xYN4VE9YFwFmHTFxBcNEKUjrflkmrnotOR5TTWW95VDm2MwUR1XEw8Ptuf4pr%2BLUXZ93UfiFG8edbupdCk71HNIfZeE85TNnh%2B1BDp0rVl9m15Jf2jf%2BlqddExqf82wnAe9MA8iPdIH%2Fqo7uyp75ev4Mjm90jlkBrL6LSk9g9dB9VFeDJing4J77pofuykVrZeTwpnEJQhUaqbU6Br1oVcogUtVfgSlh23Y9PjBx8%2BAfMC%2Ft0vhwnHSpb5NJGOcH6LWBUSpcBKaR7ZvZRWv4jVNKqT2jGPPAWUNbdueQgH1YT98X0jicmQm44u2to6MmINT0D8ZOG4qZc9PLu4wfI10toJMCg1QZ7BujIkPWgAMmOMtEsUri73CaID3tTpLhy6zzwrv%2B8NCOaKIMsFmsjC3IdJrOT15gcbV36sF682mBpvACWKzjnnPJo4NiwKsXk2kM%2FGa7kPF6R4VmtUfnJ2IIhxBaWVs4hxUJ82j1Dxp3DBJfBhEZUJb4ePRV07EJNC2iqTRQKgE8GpKSEJy838OkG2Md4i507iXwA8Q6j32OeaWY%2B%2F2oBorfgAIl8oKGMHhUyibX8M6rIvHKZnSENYaZaupTD4huKFBjqHAv9LIc9mjKVJ3BM0SzW8LDBc0jpMgccrAzgjGicP2iN%2FE%2B%2FauVMBHybr0dJQ7ixKOrp0QRxctEOmtv56FBF0md8T37xe7dwqt6mN94BnEOgZcz7k9uY9uXLS4nKan%2Fs7IFPzzduXlcdL4xbwLsdRcHrIaAyKiHzVI67jQlkr3dgW3ROQRRkJM4muccO29hopbtgfqamI3iTck2NDhCY%2B%2Bs8eZLtwmVV08A5DsdZqKcrePapltZO31e8ZSZEN6P3cnyPjTSuyvguPZWg1JAnFSBGAgMYmx7jmfcdULjb4L9KlJgcyTr5%2FQ2y8pUdi1wYTEMr%2FhhK%2FB2IjFOq78Uv8bj%2FtQmCbGMxN&X-Amz-SignedHeaders=host&X-Amz-Signature=a2304d65c0a894d736671a8b446a55f255e0745704c19ddd8951d265f39dcc7d
*/

/*
function sendBeaconRequest({ 
  credentials, 
  pinpointAppId, 
  region, 
  eventsRequest,
  url
}) {
	const accessInfo = {
		secret_key: credentials.secretAccessKey,
		access_key: credentials.accessKeyId,
		session_token: credentials.sessionToken,
	}
	const body = JSON.stringify(eventsRequest);
	const method = 'POST';

  // Pinpointt https://pinpoint.us-east-1.amazonaws.com/v1/apps/1111/events/legacy
	const request = {
		url,
		body,
		method,
	};

	const serviceInfo = { 
    region, 
    //service: 'mobiletargeting',
    service: 'lambda' 
  };

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
/**/


/* updateEndpoint usage:
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

// smaller example
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