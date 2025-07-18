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

test.after(() => {
  sandbox.restore()
})

test('should call page function in plugin', async () => {
  const pageSpy = sandbox.spy()
  const trackSpy = sandbox.spy()
  const identifySpy = sandbox.spy()

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
    assert.is(pageSpy.callCount, 1)
    assert.is(trackSpy.callCount, 0)
    assert.is(identifySpy.callCount, 0)
  })
  
  await delay(100)
})

test('should call .page callback', async () => {
  const pageSpy = sandbox.spy()
  const pageCallbackSpy = sandbox.spy()
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

  assert.is(pageCallbackSpy.callCount, 1)
  assert.is(pageSpy.callCount, 1)
})

test('page state should contain .last && .history', async () => {
  const pageSpy = sandbox.spy()
  const pageCallbackSpy = sandbox.spy()
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
  assert.ok(last.properties)
  assert.ok(last.meta)

  const history = pageState.history
  assert.is(Array.isArray(history), true)
  assert.is(history.length, 1)
})

test.run()
