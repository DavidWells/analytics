import test from 'ava'
import sinon from 'sinon'
import * as createPinpointSender from '../../src/pinpoint/helpers/create-pinpoint-sender'
import * as createEventQueue from '../../src/pinpoint/helpers/create-event-queue'
import * as mergeEndpointData from '../../src/pinpoint/helpers/merge-endpoint-data'
import { initialize } from '../../src/pinpoint'
import * as inBrowser from '../../src/utils/in-browser'

test.beforeEach(() => {
  sinon.stub(createEventQueue, 'default').returns('test queue')
  sinon.stub(mergeEndpointData, 'default')
})

test.afterEach(() => {
  sinon.restore()
})

// Browser test
test('should call window.addEventListener', async () => {
  sinon.replace(inBrowser, 'default', true)
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

test('should initialize pinpoint', async (t) => {
  const pinpointClient = initialize({ foo: 'foo' })

  t.is(typeof pinpointClient.updateEndpoint, 'function')
  t.is(pinpointClient.recordEvent, 'test queue')
  t.is(typeof pinpointClient.disable, 'function')
  console.log(pinpointClient)
})
