import '../_setup.js'
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import sinon from 'sinon'
import delay from '../_utils/delay.js'
import Analytics from '../../src/index.js'

let sandbox

test.before(() => {
  sandbox = sinon.createSandbox()
})

test('should call .on listenering in correct order', async () => {
  const executionOrder = []
  const pageExecutionOrder = []
  const pageSpy = sandbox.spy()
  const pageSpyTwo = sandbox.spy()
  const onPageStartSpy = sandbox.spy()
  const onPageSpy = sandbox.spy()
  const onPageEndSpy = sandbox.spy()
  const onPageCallback = sandbox.spy()

  const analytics = Analytics({
    app: 'appname',
    version: 100,
    plugins: [
      {
        name: 'test-plugin',
        page: () => {
          pageSpy()
          pageExecutionOrder.push(1)
        }
      },
      {
        name: 'test-plugin-two',
        page: () => {
          pageSpyTwo()
          pageExecutionOrder.push(2)
        }
      }
    ]
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

  analytics.page(() => {
    onPageCallback()
    executionOrder.push(4)
  })

  // Timeout for async actions to fire
  await delay(100)

  // Ensure the page was called
  assert.equal(pageSpy.callCount, 1)

  // Ensure the listeners callbacks are called only once
  assert.equal(onPageStartSpy.callCount, 1)
  assert.equal(onPageSpy.callCount, 1)
  assert.equal(onPageEndSpy.callCount, 1)

  // Ensure callback gets called
  assert.equal(onPageCallback.callCount, 1)

  // Ensure the callbacks are called in the correct order
  assert.equal(pageExecutionOrder, [1, 2])

  // Ensure the callbacks are called in the correct order
  assert.equal(executionOrder, [1, 2, 3, 4])
})

test('should call .once listeners only once', async () => {
  const pageSpy = sandbox.spy()
  const onPageSpy = sandbox.spy()
  const oncePageSpy = sandbox.spy()

  const analytics = Analytics({
    app: 'appname',
    version: 100,
    plugins: [
      {
        name: 'test-plugin',
        page: pageSpy
      }
    ]
  })

  analytics.once('page', oncePageSpy)

  analytics.on('page', onPageSpy)

  analytics.page()

  analytics.page()

  // Timeout for async actions to fire
  await delay(100)

  assert.is(pageSpy.callCount, 2)

  assert.is(onPageSpy.callCount, 2)

  assert.is(oncePageSpy.callCount, 1)
})

test.run()
