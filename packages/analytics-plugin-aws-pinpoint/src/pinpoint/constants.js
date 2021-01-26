
// https://docs.aws.amazon.com/pinpoint/latest/developerguide/event-streams-data-app.html#event-streams-data-app-attributes
export const EVENTS = {
  /* The endpoint began a new session. */
  SESSION_START: '_session.start',
  /* The endpoint ended a session. */
  SESSION_STOP: '_session.stop',
  /* The endpoint paused a session. Paused sessions can be resumed so that you can continue to collect metrics without starting an entirely new session. */
  SESSION_PAUSE: '_session.pause',
  /* The endpoint resumed a session. */
  SESSION_RESUME: '_session.resume',
  /* The endpoint logged in to your app. */
  AUTH_SIGN_IN: '_userauth.sign_in',
  /* A new endpoint completed the registration process in your app. */
  AUTH_SIGN_UP: '_userauth.sign_up',
  /* The endpoint attempted to sign in to your app, but wasn't able to complete the process. */
  AUTH_FAIL: '_userauth.auth_fail',
  /* The endpoint made a purchase in your app. */
  ECOM_PURCHASE: '_monetization.purchase',
  /* The pageview event */
  PAGE_VIEW: 'pageView',
}

// https://docs.aws.amazon.com/pinpoint/latest/apireference/apps-application-id-endpoints.html#apps-application-id-endpoints-prop-endpointbatchitem-channeltype
export const ALLOWED_CHANNELS = [
	'PUSH',
	'GCM',
	'APNS',
	'APNS_SANDBOX',
	'APNS_VOIP',
	'APNS_VOIP_SANDBOX',
	'ADM',
	'SMS',
	'VOICE',
	'EMAIL',
	'BAIDU',
	'CUSTOM'
]

export const CHANNEL_TYPES = ALLOWED_CHANNELS.reduce((acc, curr) => {
  acc[curr] = curr
  return acc
}, {})