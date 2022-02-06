import formatEvent from './format-event'
import mergeEndpointData from './merge-endpoint-data'
import { isBoolean } from '@analytics/type-utils'
import * as PINPOINT_EVENTS from './events'

// TODO use beacon
// import 'navigator.sendbeacon'
const BEACON_SUPPORTED = typeof navigator !== 'undefined' && navigator && typeof navigator.sendBeacon === 'function'

export default function createEventQueue(queue, config = {}) {
  return async function queueEvent(eventName, eventData = {}, endpoint = {}, flush = false) {
    if (isBoolean(eventData)) {
      eventData = {}
      flush = eventData
    }
    if (isBoolean(endpoint)) {
      endpoint = {}
      flush = endpoint
    }
    const eventPayload = await formatEvent(eventName, eventData, config)

    // IF endpoint exists, & event is PAGE_VIEW, update user attributes
    if (Object.entries(endpoint).length || eventName === PINPOINT_EVENTS.PAGE_VIEW) {
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