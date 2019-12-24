import test from 'ava'
import bodyParser from 'body-parser'
import express from 'express'
import amplitudePlugin, {AmplitudeClient} from './index'
import Analytics from 'analytics'

const testHeaders = {
	'test-header': 'value1'
}

const testOptions = {
	min_id_length: 2
}

let serverUrl
let server
let client
let analytics

let expectAmplitudeError = false, lastSentRequest = null, requestCallback = null

test.before.cb('Init test server and client', (t) => {
	const app = express()
	app.use(bodyParser.json())
	app.use(bodyParser.urlencoded({ extended: false }))

	app.all('/*', (req, res) => {
		lastSentRequest = req
		res.status(expectAmplitudeError ? 500 : 200).json({test:  1})

		if (requestCallback) {
			requestCallback(req)
		}
	})

	const portNumber = 3232 // TODO: Select any available port instead.
	server = app.listen(portNumber, (err) => {
		if (err) {
			t.end(err)
			return
		}
		serverUrl = `http://localhost:${portNumber}/`

		client = new AmplitudeClient({
			baseUrl: serverUrl,
			apiKey: 'test-api-key',
			userData: {deviceId: 'test-device'},
			httpHeaders: testHeaders,
			eventOptions: testOptions,
		})

		analytics = new Analytics({
			plugins: [
				amplitudePlugin({
					apiKey: 'test-api-key',
					options: {
						httpHeaders: testHeaders,
						eventOptions: testOptions,
						apiEndpoint: serverUrl,
					}
				})
			]
		})

		t.end()
	})
})

test.after.cb('Close test server', (t) => server.close(t.end))
test.afterEach(() => {
	requestCallback = null
	lastSentRequest = null
	expectAmplitudeError = false
})

test.serial.cb('AmplitudeClient: sendEvents', (t) => {
	const events = [
		{
			event_type: 'TestEvent',
			device_id: 'test-device',
			event_properties: { p1: 'v1' }
		}
	]
	client.sendEvents(events, (error) => {
		if (error) {
			t.end(error)
			return
		}

		const req = lastSentRequest
		t.is(req.url, '/2/httpapi')
		t.is(req.method, 'POST')
		for (const h in testHeaders) {
			t.is(req.headers[h], testHeaders[h])
		}
		t.is(req.headers['content-type'], 'application/json')
		t.deepEqual(req.body, {
			api_key: 'test-api-key',
			options: testOptions,
			events
		})

		t.end()
	})
})

test.serial.cb('AmplitudeClient: sendEvents error', (t) => {
	expectAmplitudeError = true

	client.sendEvents([], (error) => {
		if (!error) {
			t.end(new Error('An error was expected!'))
			return
		}
		t.regex(error.message, /.+{"test":1}/, 'Error message should contain details from Amplitude')
		t.end()
	})
})

test.serial.cb('AmplitudeClient: identify', (t) => {
	const data = {
		user_properties: {
			'$setOnce': {'once': 'value'}
		}
	}
	client.identify(data, (error) => {
		if (error) {
			t.end(error)
			return
		}

		const req = lastSentRequest
		t.is(req.url, '/identify')
		t.is(req.method, 'POST')
		for (const h in testHeaders) {
			t.is(req.headers[h], testHeaders[h])
		}
		t.is(req.headers['content-type'], 'application/x-www-form-urlencoded')
		t.is(req.body.api_key, 'test-api-key')
		const data = JSON.parse(req.body.identification)
		t.deepEqual(data, {
			device_id: 'test-device',
			user_properties: {
				'$setOnce': {'once': 'value'}
			}
		})

		t.end()
	})
})

test.serial.cb('amplitude: track', (t) => {
	requestCallback = (req) => {
		t.deepEqual(req.body, {
			api_key: 'test-api-key',
			options: testOptions,
			events: [
				{
					event_type: 'TestTrackEvent',
					device_id: analytics.user('anonymousId'),
					event_properties: {  p42: 'v42' },
					user_properties: { up1: 'v1' }
				}
			]
		})
		t.end()
	}

	analytics.track('TestTrackEvent', { p42: 'v42' }, { userProperties: { up1: 'v1' } })
})

test.serial.cb('amplitude: page', (t) => {
	requestCallback = (req) => {
		t.deepEqual(req.body, {
			api_key: 'test-api-key',
			options: testOptions,
			events: [
				{
					event_type: 'Page View',
					device_id: analytics.user('anonymousId'),
					event_properties: {
						p42: 'v42'
					},
					user_properties: {}
				}
			]
		})
		t.end()
	}

	analytics.page({ p42: 'v42' })
})

test.serial.cb('amplitude: identify', (t) => {
	requestCallback = (req) => {
		const data = JSON.parse(req.body.identification)
		t.deepEqual(data, {
			user_id: 'new-username',
			device_id: analytics.user('anonymousId'),
			user_properties: {
		    $set: { name: 'John' }
			}
		})
		t.end()
	}

	analytics.identify('new-username', { name: 'John' })
})

test.serial.cb('amplitude: identify error', (t) => {
	expectAmplitudeError = true

	analytics = new Analytics({
		plugins: [
			amplitudePlugin({
				apiKey: 'test-api-key',
				options: {
					apiEndpoint: serverUrl,
					errorReporter: (error) => {
						t.regex(error.message, /Amplitude/)
						t.end()
					}
				}
			})
		]
	})
	analytics.identify('test')
})
