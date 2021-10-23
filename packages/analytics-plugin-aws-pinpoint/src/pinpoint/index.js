import smartQueue from '@analytics/queue-utils'
import createEventQueue from './helpers/create-event-queue'
import mergeEndpointData from './helpers/merge-endpoint-data'
import createPinpointSender from './helpers/create-pinpoint-sender'
import * as PINPOINT_EVENTS from './helpers/events'
import { isBrowser } from '@analytics/type-utils'

const { SESSION_START, SESSION_STOP } = PINPOINT_EVENTS

function noOp() {
  return {}
}

export function initialize(config = {}) {
  // @TODO clean up
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
      events.forEach((event) => logger('> Queue event', event))
      const response = await pinpointPutEvent(events, {})
      logger('> Queue response', response)
    },
    {
      max: 10, // limit... event limit is 100 for pinpoint
      interval: config.flushInterval || 3000, // 3s
      throttle: true, // Ensure only max is processed at interval
      // onPause: (queue) => {},
      // onEmpty: () => {}
    }
  )

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
  if (!isBrowser) {
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
