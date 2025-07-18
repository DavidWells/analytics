import './_setup.js'
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import sinon from 'sinon'
import delay from './_utils/delay.js'
import Analytics from '../src/index.js'

let sandbox

test.before(() => {
  sandbox = sinon.createSandbox()
})

test.after(() => {
  sandbox.restore()
})

test('On listener and callback should still fire if no plugins', async () => {
  const onPageSpy = sandbox.spy()
  const pageCallbackSpy = sandbox.spy()

  const analytics = Analytics()

  analytics.on('pageStart', onPageSpy)
  analytics.on('page', onPageSpy)
  analytics.on('pageEnd', onPageSpy)
  analytics.page(pageCallbackSpy)

  // Timeout for async actions to fire
  await delay(100)

  assert.is(pageCallbackSpy.callCount, 1)
  assert.is(onPageSpy.callCount, 3)
})

test.run()
