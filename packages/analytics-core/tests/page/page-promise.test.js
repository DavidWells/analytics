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

test('Page returns promise', async () => {
  const analytics = Analytics({
    app: 'appname',
    version: 100
  })

  const prom = analytics.page()
  assert.is(isPromise(prom), true)
})

test('Page promise execution order', async () => {
  const executionOrder = []
  const onPageStartSpy = sandbox.spy()
  const onPageSpy = sandbox.spy()
  const onPageEndSpy = sandbox.spy()
  const onPageCallback = sandbox.spy()
  const onPagePromise = sandbox.spy()

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
  assert.equal(onPageStartSpy.callCount, 1)
  assert.equal(onPageSpy.callCount, 1)
  assert.equal(onPageEndSpy.callCount, 1)

  // Ensure callback gets called
  assert.equal(onPageCallback.callCount, 1)

  // Ensure promise.then gets called
  assert.equal(onPagePromise.callCount, 1)

  // Ensure the callbacks are called in the correct order
  assert.equal(executionOrder, [1, 2, 3, 4, 5])
})

test('Non blocking page promise execution order', async () => {
  const executionOrder = []
  const onPageStartSpy = sandbox.spy()
  const onPageSpy = sandbox.spy()
  const onPageEndSpy = sandbox.spy()
  const onPageCallback = sandbox.spy()
  const onPagePromise = sandbox.spy()

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

  await delay(100) // Reduced from 1000ms to 100ms

  // Ensure the listeners callbacks are called only once
  assert.equal(onPageStartSpy.callCount, 1)
  assert.equal(onPageSpy.callCount, 1)
  assert.equal(onPageEndSpy.callCount, 1)

  // Ensure callback gets called
  assert.equal(onPageCallback.callCount, 1)

  // Ensure promise.then gets called
  assert.equal(onPagePromise.callCount, 1)
  // Ensure the callbacks are called in the correct order
  assert.equal(executionOrder, [0, 1, 2, 3, 4, 5])
})

test.run()
