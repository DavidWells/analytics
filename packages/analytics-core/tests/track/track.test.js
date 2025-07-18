import '../_setup.js'
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import sinon from 'sinon'
import delay from '../_utils/delay.js'
import isPromise from '../_utils/isPromise.js'
import Analytics from '../../src/index.js'

let sandbox

test.before(() => {
  sandbox = sinon.createSandbox()
})

test.after(() => {
  sandbox.restore()
})

test('Track throws on malformed event', async () => {
  const analytics = Analytics({
    app: 'appname',
    version: 100
  })
  
  try {
    await analytics.track()
    assert.unreachable('Expected error to be thrown')
  } catch (error) {
    assert.is(error.message, 'EventMissing')
  }
})

test('Track returns promise', async () => {
  const analytics = Analytics({
    app: 'appname',
    version: 100
  })

  const promise = analytics.track('testing')
  assert.is(isPromise(promise), true)
})

test('Track callback is called', async () => {
  const callbackFunction = sandbox.spy()

  const analytics = Analytics({
    app: 'appname',
    version: 100
  })

  await analytics.track('testing', callbackFunction)

  assert.equal(callbackFunction.callCount, 1)
})

test('Track plugins & lifecycle fire in correct order', async () => {
  const eventName = 'track'
  const executionOrder = []
  const pluginExecutionOrder = []
  const pluginSpy = sandbox.spy()
  const pluginSpyTwo = sandbox.spy()
  const onStartSpy = sandbox.spy()
  const onSpy = sandbox.spy()
  const onEndSpy = sandbox.spy()
  const callbackSpy = sandbox.spy()
  const promiseSpy = sandbox.spy()

  const analytics = Analytics({
    app: 'appname',
    version: 100,
    plugins: [
      {
        name: 'test-plugin',
        track: () => {
          pluginSpy()
          pluginExecutionOrder.push(1)
        }
      },
      {
        name: 'test-plugin-two',
        track: () => {
          pluginSpyTwo()
          pluginExecutionOrder.push(2)
        }
      }
    ]
  })

  analytics.on(eventName, () => {
    onSpy()
    executionOrder.push(2)
  })
  analytics.on(`${eventName}End`, () => {
    onEndSpy()
    executionOrder.push(3)
  })
  analytics.on(`${eventName}Start`, () => {
    onStartSpy()
    executionOrder.push(1)
  })

  await analytics.track('eventName', () => {
    callbackSpy()
    executionOrder.push(4)

    // Ensure the page was called
    assert.is(pluginSpy.callCount, 1)
    assert.is(pluginSpyTwo.callCount, 1)

    // Ensure the listeners callbacks are called only once
    assert.is(onStartSpy.callCount, 1)
    assert.is(onSpy.callCount, 1)
    assert.is(onEndSpy.callCount, 1)

    // Ensure callback gets called
    assert.equal(callbackSpy.callCount, 1)

    // Ensure the callbacks are called in the correct order
    assert.equal(pluginExecutionOrder, [1, 2])

    // Ensure the callbacks are called in the correct order
    assert.equal(executionOrder, [1, 2, 3, 4])
  }).then(() => {
    promiseSpy()
    assert.is(promiseSpy.callCount, 1)
  })
})

test('track state should contain .last && .history', async () => {
  const trackSpy = sandbox.spy()
  const callbackSpy = sandbox.spy()
  const analytics = Analytics({
    app: 'appname',
    version: 100,
    plugins: [
      {
        name: 'test-plugin',
        track: trackSpy
      }
    ]
  })

  await analytics.track('testing', { foo: 'bar' }, callbackSpy)

  const trackState = analytics.getState('track')
  // var args = pageCallbackSpy.getCalls()[0].args
  const last = trackState.last
  assert.is(last.event, 'testing')
  assert.equal(last.properties, { foo: 'bar' })
  assert.ok(last.meta)

  const history = trackState.history
  assert.is(Array.isArray(history), true)
  assert.is(history.length, 1)
})

test.run()
