
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