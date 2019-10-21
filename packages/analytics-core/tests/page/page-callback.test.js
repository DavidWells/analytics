import test from 'ava'
import sinon from 'sinon'
import delay from '../_utils/delay'
import Analytics from '../../src'

test.beforeEach((t) => {
  t.context.sandbox = sinon.createSandbox()
})

test('should call .on listeners & callback if no plugins', async (t) => {
  const executionOrder = []
  const onPageStartSpy = t.context.sandbox.spy()
  const onPageSpy = t.context.sandbox.spy()
  const onPageEndSpy = t.context.sandbox.spy()
  const onPageCallback = t.context.sandbox.spy()

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

  analytics.page(() => {
    onPageCallback()
    executionOrder.push(4)
  })

  // Timeout for async actions to fire
  await delay(100)

  // Ensure the listeners callbacks are called only once
  t.deepEqual(onPageStartSpy.callCount, 1)
  t.deepEqual(onPageSpy.callCount, 1)
  t.deepEqual(onPageEndSpy.callCount, 1)

  // Ensure callback gets called
  t.deepEqual(onPageCallback.callCount, 1)

  // Ensure the callbacks are called in the correct order
  t.deepEqual(executionOrder, [1, 2, 3, 4])
})
