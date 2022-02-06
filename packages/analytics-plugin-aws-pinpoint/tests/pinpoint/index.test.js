import test from 'ava'
import sinon from 'sinon'
import * as createPinpointSender from '../../src/pinpoint/helpers/create-pinpoint-sender'
import * as createEventQueue from '../../src/pinpoint/helpers/create-event-queue'
import * as mergeEndpointData from '../../src/pinpoint/helpers/merge-endpoint-data'
import { initialize } from '../../src/pinpoint'
import types from '@analytics/type-utils'


let pinpointPutEventFake
let createPinpointSenderStub

test.beforeEach(() => {
  sinon.stub(createEventQueue, 'default').returns('test queue')
  sinon.stub(mergeEndpointData, 'default')
  pinpointPutEventFake = sinon.fake.returns('pinpointPutEvent called')
  createPinpointSenderStub = sinon
    .stub(createPinpointSender, 'default')
    .returns(pinpointPutEventFake)
})

test.afterEach(() => {
  sinon.restore()
})

// Browser test
test.skip('should call window.addEventListener', async () => {
  sinon.replace(types, 'isBrowser', true)
  global.window = {
    addEventListener: sinon.fake(),
  }
  const pinpointClient = initialize({ foo: 'foo' })

  sinon.assert.calledOnce(global.window.addEventListener)
})

// Node tests
test('should not call window.addEventListener', async () => {
  global.window = {
    addEventListener: sinon.fake(),
  }
  const pinpointClient = initialize({ foo: 'foo' })

  sinon.assert.notCalled(global.window.addEventListener)
})

test('should call pinpointPutEvent if updateEndpoint is call', (t) => {
  const pinpointClient = initialize({ foo: 'foo' })
  const response = pinpointClient.updateEndpoint({})

  sinon.assert.calledOnce(createPinpointSenderStub)
  sinon.assert.calledOnce(pinpointPutEventFake)
  t.is(response, 'pinpointPutEvent called')
})

test('should initialize pinpoint', async (t) => {
  const pinpointClient = initialize({ foo: 'foo' })

  t.is(typeof pinpointClient.updateEndpoint, 'function')
  t.is(pinpointClient.recordEvent, 'test queue')
  t.is(typeof pinpointClient.disable, 'function')
})
