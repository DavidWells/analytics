import test from 'ava'
import sinon from 'sinon'
import delay from '../_utils/delay'
import isPromise from '../_utils/isPromise'
import Analytics from '../../src'

test.beforeEach((t) => {
  t.context.sandbox = sinon.createSandbox()
})

test('Track throws on malformed event', async (t) => {
  const analytics = Analytics({
    app: 'appname',
    version: 100
  })
  const error = await t.throwsAsync(analytics.track())
  t.is(error.message, 'EventMissing')
})

test('Track returns promise', async (t) => {
  const analytics = Analytics({
    app: 'appname',
    version: 100
  })

  const promise = analytics.track('testing')
  t.is(isPromise(promise), true)
})

test('Track callback is called', async (t) => {
  const callbackFunction = t.context.sandbox.spy()

  const analytics = Analytics({
    app: 'appname',
    version: 100
  })

  await analytics.track('testing', callbackFunction)

  t.deepEqual(callbackFunction.callCount, 1)
})

test.cb('Track plugins & lifecycle fire in correct order', (t) => {
  const eventName = 'track'
  const executionOrder = []
  const pluginExecutionOrder = []
  const pluginSpy = t.context.sandbox.spy()
  const pluginSpyTwo = t.context.sandbox.spy()
  const onStartSpy = t.context.sandbox.spy()
  const onSpy = t.context.sandbox.spy()
  const onEndSpy = t.context.sandbox.spy()
  const callbackSpy = t.context.sandbox.spy()
  const promiseSpy = t.context.sandbox.spy()

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

  analytics.track('eventName', () => {
    callbackSpy()
    executionOrder.push(4)

    // Ensure the page was called
    t.is(pluginSpy.callCount, 1)
    t.is(pluginSpyTwo.callCount, 1)

    // Ensure the listeners callbacks are called only once
    t.is(onStartSpy.callCount, 1)
    t.is(onSpy.callCount, 1)
    t.is(onEndSpy.callCount, 1)

    // Ensure callback gets called
    t.deepEqual(callbackSpy.callCount, 1)

    // Ensure the callbacks are called in the correct order
    t.deepEqual(pluginExecutionOrder, [1, 2])

    // Ensure the callbacks are called in the correct order
    t.deepEqual(executionOrder, [1, 2, 3, 4])
  }).then(() => {
    promiseSpy()
    t.is(promiseSpy.callCount, 1)
    t.end()
  })
})

test('track state should contain .last && .history', async (t) => {
  const trackSpy = t.context.sandbox.spy()
  const callbackSpy = t.context.sandbox.spy()
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
  t.is(last.event, 'testing')
  t.deepEqual(last.properties, { foo: 'bar' })
  t.truthy(last.meta)

  const history = trackState.history
  t.is(Array.isArray(history), true)
  t.is(history.length, 1)
})
