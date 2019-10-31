import test from 'ava'
import sinon from 'sinon'
import delay from '../_utils/delay'
import isPromise from '../_utils/isPromise'
import Analytics from '../../src'

test.beforeEach((t) => {
  t.context.sandbox = sinon.createSandbox()
})

test('Page returns promise', async (t) => {
  const analytics = Analytics({
    app: 'appname',
    version: 100
  })

  const prom = analytics.page()
  t.is(isPromise(prom), true)
})

test('Page promise execution order', async (t) => {
  const executionOrder = []
  const onPageStartSpy = t.context.sandbox.spy()
  const onPageSpy = t.context.sandbox.spy()
  const onPageEndSpy = t.context.sandbox.spy()
  const onPageCallback = t.context.sandbox.spy()
  const onPagePromise = t.context.sandbox.spy()

  const analytics = Analytics({
    app: 'appname',
    version: 100
  })

  analytics.on('page', () => {
    onPageSpy()
    executionOrder.push(2)
  })
  analytics.on('pageEnd', () => {
    onPageEndSpy()
    executionOrder.push(3)
  })
  analytics.on('pageStart', () => {
    onPageStartSpy()
    executionOrder.push(1)
  })

  await analytics.page(() => {
    onPageCallback()
    executionOrder.push(4)
  }).then(() => {
    onPagePromise()
    executionOrder.push(5)
  })

  // Ensure the listeners callbacks are called only once
  t.deepEqual(onPageStartSpy.callCount, 1)
  t.deepEqual(onPageSpy.callCount, 1)
  t.deepEqual(onPageEndSpy.callCount, 1)

  // Ensure callback gets called
  t.deepEqual(onPageCallback.callCount, 1)

  // Ensure promise.then gets called
  t.deepEqual(onPagePromise.callCount, 1)

  // Ensure the callbacks are called in the correct order
  t.deepEqual(executionOrder, [1, 2, 3, 4, 5])
})

test('Non blocking page promise execution order', async (t) => {
  const executionOrder = []
  const onPageStartSpy = t.context.sandbox.spy()
  const onPageSpy = t.context.sandbox.spy()
  const onPageEndSpy = t.context.sandbox.spy()
  const onPageCallback = t.context.sandbox.spy()
  const onPagePromise = t.context.sandbox.spy()

  const analytics = Analytics({
    app: 'appname',
    version: 100
  })

  analytics.on('page', () => {
    onPageSpy()
    executionOrder.push(2)
  })
  analytics.on('pageEnd', () => {
    onPageEndSpy()
    executionOrder.push(3)
  })
  analytics.on('pageStart', () => {
    onPageStartSpy()
    executionOrder.push(0)
  })

  analytics.page(() => {
    onPageCallback()
    executionOrder.push(4)
  }).then(() => {
    onPagePromise()
    executionOrder.push(5)
  })
  executionOrder.push(1)

  await delay(1000)

  // Ensure the listeners callbacks are called only once
  t.deepEqual(onPageStartSpy.callCount, 1)
  t.deepEqual(onPageSpy.callCount, 1)
  t.deepEqual(onPageEndSpy.callCount, 1)

  // Ensure callback gets called
  t.deepEqual(onPageCallback.callCount, 1)

  // Ensure promise.then gets called
  t.deepEqual(onPagePromise.callCount, 1)
  // Ensure the callbacks are called in the correct order
  t.deepEqual(executionOrder, [0, 1, 2, 3, 4, 5])
})
