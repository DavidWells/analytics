import test from 'ava'
import sinon from 'sinon'
import callAws from '../../../src/pinpoint/helpers/call-aws'
import AWS from '@aws-sdk/client-pinpoint'

let sinonSandbox

const config = {
  pinpointRegion: 'east-1',
  pinpointAppId: 'appId',
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

test.beforeEach((t) => {
  sinonSandbox = sinon.createSandbox()
})

test.afterEach((t) => {
  sinonSandbox.restore()
})

test('should send event data', async (t) => {
  sinonSandbox.stub(AWS, 'PinpointClient')
    .returns({
      send: () => {
        return 'test'
      }
    })
  const response = await callAws(eventsRequest, config)
  console.log(response)
})
