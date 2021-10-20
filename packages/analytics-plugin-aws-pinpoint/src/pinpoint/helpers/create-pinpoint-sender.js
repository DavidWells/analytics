import { uuid } from 'analytics-utils'
import callAws from './call-aws'
import { CHANNEL_TYPES } from './constants'
import getClientInfo from '../../utils/client-info'
import { getStorageKey } from './getStorageKey'
import { getItem } from '@analytics/localstorage-utils'
import * as PINPOINT_EVENTS from './events'
import mergeEndpointData from './merge-endpoint-data'

const clientInfo = getClientInfo()
const { SESSION_START, SESSION_STOP } = PINPOINT_EVENTS
const EMAIL_REGEX = /.+\@.+\..+/
function isEmail(string) {
  return EMAIL_REGEX.test(string)
}

export default function createPinpointSender(config = {}) {
  const { getEndpointId, debug } = config

  return async function pinpointPutEvent(eventsArray = [], endpointInfo = {}) {
    /* Events are associated with an endpoint ID. */
    const id = await getEndpointId()
    // console.log('resolved endpointId', endpointId)
    if (!id) {
      console.error('No endpoint id. check getEndpointId()')
      return
    }

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
      console.log('CHANNEL_TYPE', channelType)
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
      response = await callAws(eventsRequest, config)
      // console.log('awsResponse', response)
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
