import {
  getSession,
  getTabSession,
  setTabSession,
  getPageSession,
  setPageSession,
} from '@analytics/session-utils'
import { isBrowser } from '@analytics/type-utils'
import { uuid } from 'analytics-utils'
import getClientInfo from '../../utils/client-info'
import getEventName from './get-event-name'
import { prepareAttributes, prepareMetrics } from './prepare-data'
import * as PINPOINT_EVENTS from './events'

export default async function formatEvent(eventName, data = {}, config = {}) {
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
  const sessionData = getSession()
  // @TODO refactor session grabber
  const sessionId = data.sessionId || sessionData.id
  const sessionStart = data.sessionStart || sessionData.createdAt
  const sessionStartUnix = data.sessionStart
    ? new Date(data.sessionStart).getTime()
    : sessionData.created
  logger('event sessionData    ', JSON.stringify(sessionData))

  let pageSessionInfo, tabSessionData
  if (isBrowser) {
    pageSessionInfo = getPageSession()
    tabSessionData = getTabSession()
    logger('event pageSessionInfo', JSON.stringify(pageSessionInfo))
    logger('event tabSessionData ', JSON.stringify(tabSessionData))
  }

  const eventAttribs = data.attributes || {}
  const eventId = data.eventId || uuid()
  const time = data.time ? new Date(data.time) : new Date()
  const timeStamp = time.toISOString()
  const sessionDuration = time.getTime() - sessionStartUnix

  const defaultEventAttributes = {
    date: timeStamp,
    sessionId, // Event[id].Session.Id
    ...(!isBrowser ? {} : { pageSession: pageSessionInfo.id }),
  }

  const extraAttributes = enrichEventAttributes
    ? await enrichEventAttributes()
    : {}

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

  if (isBrowser) {
    logger('clientInfo', getClientInfo())
  }

  // const appVersionCodeString = getAppVersionCode(config)
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
      ...(appVersionCode) ? { AppVersionCode: appVersionCode } : {},
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
        Id: sessionId,
        /* StartTimestamp is required */
        StartTimestamp: sessionStart, // ISOString
      },
    },
  }

  // Add session stop parameters.
  if (eventName === PINPOINT_EVENTS.SESSION_STOP) {
    // eventPayload[eventId].Session.Duration = Date.now() - subSessionStart
    // console.log('Old DURATION', Date.now() - subSessionStart)
    eventPayload[eventId].Session.Duration = sessionDuration
    // sessionData.elapsed was slightly off
    eventPayload[eventId].Session.StopTimestamp = timeStamp
  }

  return eventPayload
}
