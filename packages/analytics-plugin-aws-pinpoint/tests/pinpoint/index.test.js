import * as mergeEndpointData from '../../src/pinpoint/helpers/merge-endpoint-data'
import * as createPinpointSender from '../../src/pinpoint/helpers/create-pinpoint-sender'
import { initialize } from '../../src/pinpoint'
import test from 'ava'
import sinon from 'sinon'
import * as createEventQueue from '../../src/pinpoint/helpers/create-event-queue'

let stub
const fakeAsyncFunc = sinon.fake.resolves('pinpoint put event')
test.beforeEach(() => {
  // sinon.stub(createPinpointSender, 'default').returns(fakeAsyncFunc)
  stub = sinon.stub(createEventQueue, 'default').returns('queue')
  sinon.stub(mergeEndpointData, 'default').resolves()
})

test.afterEach(() => {
  sinon.restore()
})

test('should initialize pinpoint', async () => {
  // should return
  //  return {
  //   updateEndpoint,
  //   recordEvent: queueEvent,
  //   disable: () => {
  //     detachUnloadListener()
  //   },
  // }
  const pinpointClient = initialize({ foo: 'foo' })
  // sinon.assert.calledOnce(stub)
  console.log(pinpointClient)
})
