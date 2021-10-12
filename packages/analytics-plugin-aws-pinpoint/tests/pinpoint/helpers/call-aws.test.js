import test from 'ava'
import sinon from 'sinon'
import callAws from '../../../src/pinpoint/helpers/call-aws'
import { mockClient } from 'aws-sdk-client-mock'
import { PinpointClient, PutEventsCommand } from '@aws-sdk/client-pinpoint'
import { AwsClient } from 'aws4fetch'
import * as inBrowser from '../../../src/utils/in-browser'

test.afterEach(() => {
  sinon.restore()
})

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

test('should call aws4fetch', async (t) => {
  sinon.replace(inBrowser, 'default',
  true)
  const AwsClientStub = sinon.stub(AwsClient.prototype, 'fetch').resolves(Promise.resolve('fetch'))
  const data = await callAws(eventsRequest, config)
})

test('should send event data', async (t) => {
  pinpointMock.on(PutEventsCommand).resolves({
    $metadata: {
      attempts: 1,
      cfId: 'foo',
      extendedRequestId: 'bar',
      httpStatusCode: 202,
      requestId: 'baz',
      totalRetryDelay: undefined,
    },
    EventsResponse: {
      Results: {
        foo: 'lol',
        bar: 100,
      },
    },
  })

  const data = await callAws(eventsRequest, config)
  t.deepEqual(data, {
    $metadata: {
      attempts: 1,
      cfId: 'foo',
      extendedRequestId: 'bar',
      httpStatusCode: 202,
      requestId: 'baz',
      totalRetryDelay: undefined,
    },
    EventsResponse: {
      Results: {
        foo: 'lol',
        bar: 100,
      },
    },
  })
})
