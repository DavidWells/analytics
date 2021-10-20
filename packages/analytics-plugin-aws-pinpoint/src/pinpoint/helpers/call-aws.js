import { AwsClient } from 'aws4fetch'

let AWS
if (!process.browser) {
  // TODO: Using import causes build to fail
  AWS = require('@aws-sdk/client-pinpoint')
}

const RETRYABLE_CODES = [429, 500]
const ACCEPTED_CODES = [202]
const FORBIDDEN_CODE = 403
const BAD_REQUEST_CODE = 400

export default async function callAws(eventsRequest, config) {
  const {
    pinpointRegion,
    pinpointAppId,
    lambdaArn,
    lambdaRegion,
    credentials,
    getCredentials,
    debug,
  } = config

  const auth = await getAuth(credentials, getCredentials)
  if (debug) {
    console.log('pinpoint auth', auth)
  }

  const lambda_region = lambdaRegion || pinpointRegion
  const pinpoint_region = pinpointRegion || lambdaRegion

  const fips = config.fips === true ? '-fips' : ''
  const LAMBDA_FN = `https://lambda.${lambda_region}.amazonaws.com/2015-03-31/functions/${lambdaArn}/invocations`
  const PINPOINT_URL = `https://pinpoint${fips}.${pinpoint_region}.amazonaws.com/v1/apps/${pinpointAppId}/events`
  const endpointUrl = lambdaArn ? LAMBDA_FN : PINPOINT_URL

  /* @TODO get beacon working with API gateway/lambda/pinpoint legacy endpoint
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

  let aws, data
  const payload = {
    body: JSON.stringify(eventsRequest),
  }
  
  if (process.browser) {
    aws = new AwsClient(auth)
    data = await aws.fetch(endpointUrl, payload).then((d) => d.json())
  } else {

    aws = new AWS.PinpointClient({
      credentials: auth,
      region: pinpointRegion,
    })

    const command = new AWS.PutEventsCommand({
      ApplicationId: pinpointAppId,
      EventsRequest: eventsRequest,
    })
    data = await aws.send(command)
  }

  if (data && data.Results) {
    // Process api responses
    const responses = Object.keys(data.Results).map(
      (eventId) => data.Results[eventId]
    )
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

async function getAuth(credentials, getCredentials) {
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
  return auth
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
