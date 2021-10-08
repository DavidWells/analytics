import test from 'ava'
import sinon from 'sinon'
import createPinpointSender from '../../../src/pinpoint/helpers/create-pinpoint-sender'
import * as callAws from '../../../src/pinpoint/helpers/call-aws'
import * as mergeEndpointData from '../../../src/pinpoint/helpers/merge-endpoint-data'

let sandbox
let mergeEndpointDataStub
let callAwsStub

test.beforeEach(() => {
  sandbox = sinon.createSandbox()
  mergeEndpointDataStub = sandbox.stub(mergeEndpointData, 'default').resolves({
    requestId: 'id',
  })
  callAwsStub = sandbox.stub(callAws, 'default')
})

test.afterEach(() => {
  sandbox.restore()
})

test('should return undefined if getEndpointId does not return id', async (t) => {
  const getEndpointIdFake = sandbox.fake()
  const pinpointPutEvent = createPinpointSender({
    getEndpointId: getEndpointIdFake,
  })
  const response = await pinpointPutEvent([], {})
  t.is(response, undefined)
})

test('should call mergeEndpointData if endpointInfo is provided', async () => {
  const getEndpointIdFake = sandbox.fake.returns('id')
  const endpointInfo = {
    foo: 'foo',
  }
  const pinpointPutEvent = createPinpointSender({
    getEndpointId: getEndpointIdFake,
  })
  const response = await pinpointPutEvent([], endpointInfo)
  sandbox.assert.calledOnce(mergeEndpointDataStub)
})

test('should return valid response', async (t) => {
  callAwsStub.returns('aws')
  const getEndpointIdFake = sandbox.fake.resolves('id')
  const config = {
    getEndpointId: getEndpointIdFake,
    debug: false,
  }
  const pinpointPutEvent = createPinpointSender(config)
  const returnObject = await pinpointPutEvent([], {})

  // TODO: build regex pattern to check for response.endpoint object
  t.regex(JSON.stringify(returnObject.endpoint), /RequestId/)
  t.is(returnObject.response, 'aws')
  t.deepEqual(returnObject.events, [])
  t.is(returnObject.error, undefined)
})

test('should set error if callAws fails', async (t) => {
  callAwsStub.throws({ message: 'Error calling AWS' })
  const getEndpointIdFake = sandbox.fake.resolves('id')
  const config = {
    getEndpointId: getEndpointIdFake,
    debug: false,
  }
  const pinpointPutEvent = createPinpointSender(config)
  const returnObject = await pinpointPutEvent([], {})
  t.deepEqual(returnObject.error, { message: 'Error calling AWS' })
})
