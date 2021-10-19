import test from 'ava'
import sinon from 'sinon'
import createPinpointSender from '../../../src/pinpoint/helpers/create-pinpoint-sender'
import * as mergeEndpointData from '../../../src/pinpoint/helpers/merge-endpoint-data'
import * as callAws from '../../../src/pinpoint/helpers/call-aws'

let mergeEndpointDataStub
let callAwsStub
let getEndpointIdFake

test.beforeEach(() => {
  mergeEndpointDataStub = sinon.stub(mergeEndpointData, 'default').resolves({
    ChannelType: 'fake channel',
  })
  callAwsStub = sinon.stub(callAws, 'default')
  getEndpointIdFake = sinon.fake.returns('id')
})

test.afterEach(() => {
  sinon.restore()
})

test('should return undefined if getEndpointId does not return id', async (t) => {
  const pinpointPutEvent = createPinpointSender({
    getEndpointId: sinon.fake(),
  })
  const response = await pinpointPutEvent([], {})

  t.is(response, undefined)
})

test('should return valid endpoint data', async (t) => {
  callAwsStub.resolves('aws')
  const config = {
    getEndpointId: getEndpointIdFake,
    debug: false,
  }
  const endpointInfo = {
    foo: 'foo',
  }
  const pinpointPutEvent = createPinpointSender(config)
  const endpointData = await pinpointPutEvent(['bar', 'baz'], endpointInfo)

  sinon.assert.calledOnce(mergeEndpointDataStub)
  t.is(endpointData.endpoint.ChannelType, 'fake channel')
  t.regex(
    JSON.stringify(endpointData.endpoint.RequestId),
    /\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/
  )
  t.is(endpointData.response, 'aws')
  t.deepEqual(endpointData.events, ['bar', 'baz'])
  t.is(endpointData.error, undefined)
})

test('should set error if callAws fails', async (t) => {
  callAwsStub.throws({ message: 'Error calling AWS' })
  const config = {
    getEndpointId: getEndpointIdFake,
    debug: false,
  }
  const pinpointPutEvent = createPinpointSender(config)
  const returnObject = await pinpointPutEvent([], {})

  t.deepEqual(returnObject.error, { message: 'Error calling AWS' })
})
