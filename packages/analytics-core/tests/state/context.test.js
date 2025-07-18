import '../_setup.js'
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import Analytics from '../../src/index.js'

test('Should contain the app name', async () => {
  const analytics = Analytics({
    app: 'appname',
    version: 100
  })

  assert.is(analytics.getState('context.app'), 'appname')
})

test('Should contain the app version', async () => {
  const analytics = Analytics({
    app: 'appname',
    version: 100
  })

  assert.is(analytics.getState('context.version'), 100)
})

test('Should contain debug', async () => {
  const analytics = Analytics({
    app: 'appname',
    version: 100,
    debug: true
  })

  assert.is(analytics.getState('context.debug'), true)
})

test.run()
