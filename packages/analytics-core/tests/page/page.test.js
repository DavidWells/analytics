import test from 'ava'
import sinon from 'sinon'
import delay from '../_utils/delay'
import Analytics from '../../src'

test.beforeEach((t) => {
  t.context.sandbox = sinon.createSandbox()
})

test.cb('should call page function in plugin', (t) => {
  const pageSpy = t.context.sandbox.spy()
  const trackSpy = t.context.sandbox.spy()
  const identifySpy = t.context.sandbox.spy()

  const analytics = Analytics({
    app: 'appname',
    version: 100,
    plugins: [
      {
        name: 'test-plugin',
        track: trackSpy,
        page: pageSpy,
        identify: identifySpy
      }
    ]
  })

  analytics.page(() => {
    t.is(pageSpy.callCount, 1)
    t.is(trackSpy.callCount, 0)
    t.is(identifySpy.callCount, 0)
    t.end()
  })
})

test('should call .page callback', async (t) => {
  const pageSpy = t.context.sandbox.spy()
  const pageCallbackSpy = t.context.sandbox.spy()
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

  analytics.page(pageCallbackSpy)
  await delay(100)
  // var args = pageCallbackSpy.getCalls()[0].args

  t.is(pageCallbackSpy.callCount, 1)
  t.is(pageSpy.callCount, 1)
})

test('page state should contain .last && .history', async (t) => {
  const pageSpy = t.context.sandbox.spy()
  const pageCallbackSpy = t.context.sandbox.spy()
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

  analytics.page(pageCallbackSpy)
  await delay(100)

  const pageState = analytics.getState('page')
  // var args = pageCallbackSpy.getCalls()[0].args
  const last = pageState.last
  t.truthy(last.properties)
  t.truthy(last.meta)

  const history = pageState.history
  t.is(Array.isArray(history), true)
  t.is(history.length, 1)
})
