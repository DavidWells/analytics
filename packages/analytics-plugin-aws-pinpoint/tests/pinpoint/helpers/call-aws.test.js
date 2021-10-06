import test from 'ava'
import { mockClient } from 'aws-sdk-client-mock'
import { PinpointClient, PutEventsCommand } from '@aws-sdk/client-pinpoint'
import callAws from '../../../src/pinpoint/helpers/call-aws'

const config = {
  pinpointRegion: 'east',
  // pinpointAppId: 'appId',
  credentials: {
    accessKeyId: 'foo',
    secretAccessKey: 'bar',
  },
}

const eventsRequest = {
  BatchItem: {
    endpointId: {
      Endpoint: 'endpoint',
      Events: 'events',
    },
  },
}

const pinpointMock = mockClient(PinpointClient)

test('should send event data', async (t) => {
  pinpointMock
    .on(PutEventsCommand)
    .resolves({
      $metadata: {
        attempts: 1,
        cfId: 'foo',
        extendedRequestId: 'bar',
        httpStatusCode: 202,
        requestId: 'baz',
        totalRetryDelay: undefined
      },
      EventsResponse: {
        Results: {
          foo: 'lol',
          bar: 100
        }
      }
    })
  
  const data = await callAws(eventsRequest, config)
  t.deepEqual(data, {
    $metadata: {
      attempts: 1,
      cfId: 'foo',
      extendedRequestId: 'bar',
      httpStatusCode: 202,
      requestId: 'baz',
      totalRetryDelay: undefined
    },
    EventsResponse: {
      Results: {
        foo: 'lol',
        bar: 100
      }
    }
  })
})
