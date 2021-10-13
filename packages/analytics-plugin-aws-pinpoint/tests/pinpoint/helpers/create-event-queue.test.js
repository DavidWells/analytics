import test from 'ava'
import sinon from 'sinon'
import * as formatEvent from '../../../src/pinpoint/helpers/format-event'
import createEventQueue from '../../../src/pinpoint/helpers/create-event-queue'
import * as mergeEndpointData from '../../../src/pinpoint/helpers/merge-endpoint-data'

let mergeEndpointDataStub
let queue

test.beforeEach(() => {
  queue = {
    push: sinon.fake(),
    flush: sinon.fake(),
  }
  sinon.stub(formatEvent, 'default').resolves()
  mergeEndpointDataStub = sinon
    .stub(mergeEndpointData, 'default')
    .resolves('endpoint')
})

test.afterEach(() => {
  sinon.restore()
})

test('should call queue.push', async () => {
  const eventData = { bar: 'bar' }
  const endpoint = undefined
  const queueEvent = createEventQueue(queue, { foo: 'foo' })
  const response = await queueEvent('', eventData, endpoint)
  sinon.assert.calledOnce(queue.push)
  sinon.assert.notCalled(queue.flush)
})

test('should call queue.flush if flush is true', async () => {
  const queueEvent = createEventQueue(queue, { foo: 'foo' })
  const eventData = {}
  const endpoint = {}
  const flush = true
  const response = await queueEvent('foo', eventData, endpoint, flush)

  sinon.assert.calledOnce(queue.push)
  sinon.assert.calledOnce(queue.flush)
})

test('should call queue.flush if eventData is boolean', async () => {
  const queueEvent = createEventQueue(queue, { foo: 'foo' })
  const eventData = false
  const endpoint = {}
  const response = await queueEvent('foo', eventData, endpoint)

  sinon.assert.calledOnce(queue.push)
  sinon.assert.calledOnce(queue.flush)
})

test('should not call queue.flush if eventData is not boolean', async () => {
  const queueEvent = createEventQueue(queue, { foo: 'foo' })
  const eventData = 'lol'
  const endpoint = {}
  const response = await queueEvent('foo', eventData, endpoint)

  sinon.assert.calledOnce(queue.push)
  sinon.assert.notCalled(queue.flush)
})

test('should call queue.flush if endpoint is boolean', async () => {
  const queueEvent = createEventQueue(queue, { foo: 'foo' })
  const eventData = 'lol'
  const endpoint = true
  const response = await queueEvent('foo', eventData, endpoint)

  sinon.assert.calledOnce(queue.push)
  sinon.assert.calledOnce(queue.flush)
})

test('should not call queue.flush if endpoint is not boolean', async () => {
  const queueEvent = createEventQueue(queue, { foo: 'foo' })
  const eventData = 'lol'
  const endpoint = undefined
  const response = await queueEvent('foo', eventData, endpoint)

  sinon.assert.calledOnce(queue.push)
  sinon.assert.notCalled(queue.flush)
})

test('should call mergeEndpointData with endpoint data', async () => {
  const queueEvent = createEventQueue(queue, { foo: 'foo' })
  const eventData = {}
  const endpoint = { baz: 'baz' }
  const response = await queueEvent('foo', eventData, endpoint)

  sinon.assert.calledOnce(mergeEndpointDataStub)
  sinon.assert.calledOnce(queue.push)
  sinon.assert.notCalled(queue.flush)
})
