import test from 'ava'
import sinon from 'sinon'
import delay from './_utils/delay'
import Analytics from '../src'

test.beforeEach((t) => {
  t.context.sandbox = sinon.createSandbox()
})

test.only('On listener and callback should still fire if no plugins', async (t) => {
  const { context } = t
  const onPageSpy = context.sandbox.spy()
  const pageCallbackSpy = context.sandbox.spy()

  const analytics = Analytics()

  analytics.on('pageStart', onPageSpy)
  analytics.on('page', onPageSpy)
  analytics.on('pageEnd', onPageSpy)
  analytics.page(pageCallbackSpy)

  // Timeout for async actions to fire
  await delay(100)

  t.is(pageCallbackSpy.callCount, 1)
  t.is(onPageSpy.callCount, 3)
})
