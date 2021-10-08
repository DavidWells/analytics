import test from 'ava'
import sinon from 'sinon'
import createEventQueue from '../../../src/pinpoint/helpers/create-event-queue'
import * as formatEvent from '../../../src/pinpoint/helpers/format-event'
import * as mergeEndpointData from '../../../src/pinpoint/helpers/merge-endpoint-data'

let sandbox
let formatEventStub
let mergeEndpointDataStub
let queue

test.beforeEach(() => {
  sandbox = sinon.createSandbox()
  queue = {
    push: sandbox.fake(),
    flush: sandbox.fake(),
  }
  formatEventStub = sandbox.stub(formatEvent, 'formatEvent').resolves('event')
  console.log(mergeEndpointData, '********* import mergeEndpointData in  eventqueue.test *****')
  mergeEndpointDataStub = sandbox
    .stub(mergeEndpointData, 'default')
    .resolves('endpoint')
})
// [Function: mergeEndpointData] ******* function
test.afterEach(() => {
  sandbox.restore()
})

test('should call queue.push', async () => {
  const eventData = { bar: 'bar' }
  const endpoint = undefined
  const queueEvent = createEventQueue(queue, { foo: 'foo' })
  const response = await queueEvent('', eventData, endpoint)
  sandbox.assert.calledOnce(formatEventStub)
  sandbox.assert.calledOnce(queue.push)
  sandbox.assert.notCalled(queue.flush)
})

test('should call queue.flush if flush is true', async () => {
  const queueEvent = createEventQueue(queue, { foo: 'foo' })
  const eventData = {}
  const endpoint = {}
  const flush = true
  const response = await queueEvent('foo', eventData, endpoint, flush)
  sandbox.assert.calledOnce(formatEventStub)
  sandbox.assert.calledOnce(queue.flush)
})

test('should call queue.flush if eventData is boolean', async () => {
  const queueEvent = createEventQueue(queue, { foo: 'foo' })
  const eventData = false
  const endpoint = {}
  const response = await queueEvent('foo', eventData, endpoint)
  sandbox.assert.calledOnce(queue.flush)
})

test('should not call queue.flush if eventData is not boolean', async () => {
  const queueEvent = createEventQueue(queue, { foo: 'foo' })
  const eventData = 'lol'
  const endpoint = {}
  const response = await queueEvent('foo', eventData, endpoint)
  sandbox.assert.notCalled(queue.flush)
})

test('should call queue.flush if endpoint is boolean', async () => {
  const queueEvent = createEventQueue(queue, { foo: 'foo' })
  const eventData = 'lol'
  const endpoint = true
  const response = await queueEvent('foo', eventData, endpoint)
  sandbox.assert.calledOnce(queue.flush)
})

test('should not call queue.flush if endpoint is not boolean', async () => {
  const queueEvent = createEventQueue(queue, { foo: 'foo' })
  const eventData = 'lol'
  const endpoint = undefined
  const response = await queueEvent('foo', eventData, endpoint)
  sandbox.assert.notCalled(queue.flush)
})

test('should call mergeEndpointData with endpoint data', async () => {
  const queueEvent = createEventQueue(queue, { foo: 'foo' })
  const eventData = {}
  const endpoint = { baz: 'baz' }
  const response = await queueEvent('foo', eventData, endpoint)
  sandbox.assert.calledOnce(mergeEndpointDataStub)
})
