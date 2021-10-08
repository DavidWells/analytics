import test from 'ava'
import sinon from 'sinon'
import * as mergeEndpointData from '../../../src/pinpoint/helpers/merge-endpoint-data'
import * as createPinpointSender from '../../../src/pinpoint/helpers/create-pinpoint-sender'
import { initialize } from '../../../src/pinpoint/setup'

let sandbox
let createPinpointSenderStub
let mergeEndpointDataStub

sandbox = sinon.createSandbox()
console.log(
  mergeEndpointData,
  '******* import mergeEndpointData in index.test ****'
)
test.beforeEach(() => {
  mergeEndpointDataStub = sandbox
    .stub(mergeEndpointData, 'default')
    .resolves('endpoint')

  createPinpointSenderStub = sandbox
    .stub(createPinpointSender, 'default')
    .returns('sender')
})

test.afterEach(() => {
  sandbox.restore()
})

test('should initialize pinpoint', async (t) => {
  t.pass()
  const pinpointClient = initialize({})
  sandbox.assert.calledOnce(mergeEndpointDataStub)
  // console.log(pinpointClient, '******* pinpoint client *******')
})

// [Function: functionStub] ******* function ******

// { default: { default: [Function: mergeEndpointData] } } ******* import mergeEndpointData in index.test ****
// { default: [Function: mergeEndpointData] } ********* import mergeEndpointData in  eventqueue.test *****
