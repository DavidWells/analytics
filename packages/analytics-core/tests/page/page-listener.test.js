import test from 'ava'
import sinon from 'sinon'
import delay from '../_utils/delay'
import Analytics from '../../src'

test.beforeEach((t) => {
  t.context.sandbox = sinon.createSandbox()
})

test('should call .on listenering in correct order', async (t) => {
  const executionOrder = []
  const pageExecutionOrder = []
  const { context } = t
  const pageSpy = context.sandbox.spy()
  const pageSpyTwo = context.sandbox.spy()
  const onPageStartSpy = context.sandbox.spy()
  const onPageSpy = context.sandbox.spy()
  const onPageEndSpy = context.sandbox.spy()
  const onPageCallback = context.sandbox.spy()

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
  t.deepEqual(pageSpy.callCount, 1)

  // Ensure the listeners callbacks are called only once
  t.deepEqual(onPageStartSpy.callCount, 1)
  t.deepEqual(onPageSpy.callCount, 1)
  t.deepEqual(onPageEndSpy.callCount, 1)

  // Ensure callback gets called
  t.deepEqual(onPageCallback.callCount, 1)

  // Ensure the callbacks are called in the correct order
  t.deepEqual(pageExecutionOrder, [1, 2])

  // Ensure the callbacks are called in the correct order
  t.deepEqual(executionOrder, [1, 2, 3, 4])
})

test('should call .once listeners only once', async (t) => {
  const { context } = t
  const pageSpy = context.sandbox.spy()
  const onPageSpy = context.sandbox.spy()
  const oncePageSpy = context.sandbox.spy()

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

  t.is(pageSpy.callCount, 2)

  t.is(onPageSpy.callCount, 2)

  t.is(oncePageSpy.callCount, 1)
})
