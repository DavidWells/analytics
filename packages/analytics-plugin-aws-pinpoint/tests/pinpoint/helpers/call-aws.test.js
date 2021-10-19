import test from 'ava'
import sinon from 'sinon'
import { AwsClient } from 'aws4fetch'
import process from 'process'
import callAws from '../../../src/pinpoint/helpers/call-aws'
import { mockClient } from 'aws-sdk-client-mock'
import { PinpointClient, PutEventsCommand } from '@aws-sdk/client-pinpoint'

let aws4fetchStub

test.beforeEach(() => {
  const response = {
    json: () => {
      return {
        status: 200,
        result: 'result',
      }
    },
  }
  aws4fetchStub = sinon
    .stub(AwsClient.prototype, 'fetch')
    .returns(Promise.resolve(response))
})

test.afterEach(() => {
  sinon.restore()
})

const config = {
  pinpointRegion: 'east',
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

// Browser test
test('should call using aws4fetch', async (t) => {
  process.browser = true
  const data = await callAws(eventsRequest, config)

  sinon.assert.calledOnce(aws4fetchStub)
  t.is(data.status, 200)
  t.is(data.result, 'result')
})

// Node test
test('should call using aws pinpoint sdk', async (t) => {
  process.browser = false
  const pinpointMock = mockClient(PinpointClient)
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

  sinon.assert.notCalled(aws4fetchStub)
  t.is(pinpointMock.calls().length, 1)
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
