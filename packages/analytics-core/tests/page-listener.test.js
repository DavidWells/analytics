import test from 'ava'
import sinon from 'sinon'
import Analytics from '../src'

test.beforeEach((t) => {
  t.context.sandbox = sinon.createSandbox()
})

test('should call .on listenering in correct order', async (t) => {
  const executionOrder = []
  const pageExecutionOrder = []
  const pageSpy = t.context.sandbox.spy()
  const pageSpyTwo = t.context.sandbox.spy()
  const onPageStartSpy = t.context.sandbox.spy()
  const onPageSpy = t.context.sandbox.spy()
  const onPageEndSpy = t.context.sandbox.spy()
  const onPageCallback = t.context.sandbox.spy()

  const analytics = Analytics({
    app: 'appname',
    version: 100,
    plugins: [
      {
        NAMESPACE: 'test-plugin',
        page: () => {
          pageSpy()
          pageExecutionOrder.push(1)
        }
      },
      {
        NAMESPACE: 'test-plugin-two',
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
  await delay(1000)

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

function delay(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout)
  })
}
