import request from 'request'
import url from 'url'

/**
 * Amplitude plugin
 * @link https://getanalytics.io/plugins/amplitude/
 * @link https://amplitude.com/
 * @link https://developers.amplitude.com
 * @param {object} pluginConfig - Plugin settings
 * @param {string} pluginConfig.apiKey - Amplitude project API key
 * @param {object} pluginConfig.options - Options that define how to report data to Amplitude
 * @param {string} pluginConfig.options.apiEndpoint - Amplitude API endpoint
 * @param {string} pluginConfig.options.httpHeaders - Extra HTTP headers to add to API calls
 * @param {string} pluginConfig.options.eventOptions - Event ingestion options; see https://developers.amplitude.com/#http-api-v2-request-format
 * @return {*}
 * @example
 *
 * amplitude({
 *   apiKey: 'token'
 * })
 */
export default function amplitude(pluginConfig = {}) {
	// AmplitudeClient instance.
	let client = null;
	// Flag is set to true after the client is initialized.
	let ready = false;

	// Amplitude operation completion handler.
	let opHandler = null;

	// TODO: Replace with handling storage events.
	const userProperties = {};

	return {
		name: 'amplitude',
		config: pluginConfig,

		initialize: ({ config, instance }) => {
			const { apiKey, options } = config
			if (!apiKey) {
				throw new Error('Amplitude project API key is not defined')
			}

			const opts = options || {}

			let endpoint = opts.apiEndpoint || defaultApiEndpoint
			let baseUrl = null
			try {
				new url.URL(endpoint)
				// Endpoint is defined as a URL.
				baseUrl = endpoint
			} catch {
				// Endpoint is defined as a domain name (like how it's configured in the browser SDK).
				baseUrl = 'https://' + endpoint + '/'
			}

			const deviceId = instance.user('anonymousId')

			opHandler = (error) => {
				if (error && opts.errorReporter) {
					opts.errorReporter(error)
				}
			}

			client = new AmplitudeClient({
				baseUrl,
				apiKey,
				userProperties,
				httpHeaders: opts.httpHeaders,
				eventOptions: opts.eventOptions,
				userData: { deviceId }
			})
			ready = true
		},

		page: ({ payload: { properties, options } }) => {
			let eventType = 'Page View'
			if (options && options.eventType) {
				eventType = options.eventType
			}
			client.logEvent(eventType, properties, opHandler)
		},

		track: ({ payload: { event, properties, options } }) => {
			let payloadBase = null
			if (options.userProperties) {
				payloadBase = {
					user_properties: options.userProperties
				}
			}
			client.logEvent(event, properties, payloadBase, opHandler)
		},

		identify: ({ payload: { userId, traits } }) => {
			client.identify({
				user_id: userId,
				user_properties: {
					$set: traits
				}
			}, opHandler)
		},

		loaded: () => ready
	}
}

const defaultApiEndpoint = 'api.amplitude.com'

const responseHandler = (cb) => (error, resp, body) => {
	if (!cb) {
		return
	}
	if (error) {
		cb(error)
		return
	}
	if (resp.statusCode !== 200) {
		const details = typeof body === 'object' ? JSON.stringify(body) : body.toString()
		cb(new Error(`Unexpected response from Amplitude ${resp.statusCode}: ${details}`))
		return
	}
	cb()
}

/**
 * Amplitude client that uses Amplitude HTTP API v2.
 * This client is designed to report data for a single user.
 *
 * See
 * - https://developers.amplitude.com/#Http-Api-V2
 * - https://developers.amplitude.com/#identify-api
 */
export class AmplitudeClient {
	constructor({baseUrl, apiKey, userData, httpHeaders, eventOptions, userProperties, errorReporter}) {
		this._baseUrl = baseUrl
		this._apiKey = apiKey
		this._httpHeaders = httpHeaders ? Object.assign({}, httpHeaders) : {}
		this._eventOptions = eventOptions
		this._userData = userData || {}
		this._userProperties = userProperties
		this._errorReporter = errorReporter
	}

	prepareRequestOptions(path) {
		return {
			method: 'POST',
			uri: `${this._baseUrl}${path}`,
			gzip: true,
			headers: this._httpHeaders,
		}
	}

	identify(payload, cb) {
		const data = {
			user_id: this._userData.userId,
			device_id: this._userData.deviceId
		}
		Object.assign(data, payload)
		request(Object.assign(this.prepareRequestOptions('identify'), {
			json: true,
			form: {
				api_key: this._apiKey,
				identification: JSON.stringify(data)
			}
		}), responseHandler(cb))
	}

	sendEvents(events, cb) {
		request(Object.assign(this.prepareRequestOptions('2/httpapi'), {
			json: true,
			body: {
				api_key: this._apiKey,
				events,
				options: this._eventOptions
			}
		}), responseHandler(cb))
	}

	logEvent(eventType, properties, payloadBase, cb) {
		const eventData = {}
		if (this._userProperties) {
			eventData.user_properties = this._userProperties
		}
		if (payloadBase) {
			Object.assign(eventData, payloadBase)
		}

		eventData.user_id = this._userData.userId
		eventData.device_id = this._userData.deviceId

		if (eventType) {
			eventData.event_type = eventType
		}
		if (properties) {
			eventData.event_properties = properties
		}

		this.sendEvents([eventData], cb)
	}
}
