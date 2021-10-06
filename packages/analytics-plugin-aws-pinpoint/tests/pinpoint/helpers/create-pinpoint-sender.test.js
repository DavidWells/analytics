import test from 'ava'
import sinon from 'sinon'
import createPinpointSender from '../../../src/pinpoint/helpers/create-pinpoint-sender'
import * as callAws from '../../../src/pinpoint/helpers/call-aws'

test.skip('should return undefined if getEndpointId does not return id', async (t) => {
  const fakeGetEndpointId = sinon.fake();
  const pinpointPutEvent = createPinpointSender({ getEndpointId: fakeGetEndpointId })
  const response = await pinpointPutEvent([], {})
  t.is(response, undefined)
})

test('should return valid response', async (t) => {
  const fakeGetEndpointId = sinon.fake.resolves('id')
  const config = {
    getEndpointId: fakeGetEndpointId,
    debug: false
  }
  const pinpointPutEvent = createPinpointSender(config) 
  const callAwsStub = sinon.stub(callAws, 'default').returns('aws')
  const response = await pinpointPutEvent([], {})
  console.log(response, '******* RESPONSE *******')

  // TODO: build regex pattern to check for response.endpoint object
  t.regex(JSON.stringify(response.endpoint), /RequestId/)
  t.is(response.response, 'aws')
  t.deepEqual(response.events, [])
  t.is(response.error, undefined)
})