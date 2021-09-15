import { uuid } from 'analytics-utils'
import smartQueue from '@analytics/queue-utils'
import { setItem, getItem, removeItem } from '@analytics/localstorage-utils'
import createEventQueue from '../create-event-queue'
import mergeEndpointData from '../merge-endpoint-data'
import * as PINPOINT_EVENTS from '../events'

// TODO: Using import causes build to fail
const AWS = require('@aws-sdk/client-pinpoint')

const { SESSION_START, SESSION_STOP } = PINPOINT_EVENTS

const ENDPOINT_KEY = '__endpoint'
const RETRYABLE_CODES = [429, 500]
const ACCEPTED_CODES = [202]
const FORBIDDEN_CODE = 403
const BAD_REQUEST_CODE = 400

function noOp() {
  return {}
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
      // onPause: (queue) => {},
      // onEmpty: () => {}
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

function getEndpoint(id) {
  try {
    return JSON.parse(getItem(getStorageKey(id))) || {}
  } catch (error) {}
  return {}
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

    // Build endpoint data.
    endpoint.RequestId = uuid()

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

  const command = new AWS.PutEventsCommand({
    ApplicationId: pinpointAppId,
    EventsRequest: eventsRequest
  })
  const data = await pinpointClient.send(command)
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

function handleEndpointUpdateBadRequest(error, endpoint) {
  const { StatusCode, Message } = error
  // console.log('message', Message)
  if (StatusCode === BAD_REQUEST_CODE) {
    if (Message.startsWith('Exceeded maximum endpoint per user count')) {
      throw new Error('Exceeded maximum endpoint per user count')
    }
  } else if (StatusCode === FORBIDDEN_CODE) {
    // Handle forbidden
  }
}
