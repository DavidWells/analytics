import test from 'ava'
import sinon from 'sinon'
import Analytics from '../'

test.beforeEach((t) => {
  // https://sinonjs.org/releases/latest/sandbox/
  t.context.sandbox = sinon.createSandbox()
})

test('should call page function in plugin', (t) => {
  const pageSpy = t.context.sandbox.spy()
  const trackSpy = t.context.sandbox.spy()
  const analytics = Analytics({
    app: 'appname',
    version: 100,
    plugins: [
      {
        NAMESPACE: 'test-plugin',
        track: trackSpy,
        page: pageSpy
      }
    ]
  })

  analytics.page()

  t.deepEqual(pageSpy.callCount, 1)
  t.deepEqual(trackSpy.callCount, 0)
})

test('should call .page callback', (t) => {
  const pageSpy = t.context.sandbox.spy()
  const pageCallbackSpy = t.context.sandbox.spy()
  const analytics = Analytics({
    app: 'appname',
    version: 100,
    plugins: [
      {
        NAMESPACE: 'test-plugin',
        page: pageSpy
      }
    ]
  })

  analytics.page(() => {
    console.log('page done')
  })

  t.deepEqual(pageSpy.callCount, 1)
  t.deepEqual(pageCallbackSpy.callCount, 1)
})
