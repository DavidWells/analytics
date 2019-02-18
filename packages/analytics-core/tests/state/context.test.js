import test from 'ava'
import Analytics from '../../src'

test('Should contain the app name', async (t) => {
  const analytics = Analytics({
    app: 'appname',
    version: 100
  })

  t.deepEqual(analytics.getState('context.app'), 'appname')
})

test('Should contain the app version', async (t) => {
  const analytics = Analytics({
    app: 'appname',
    version: 100
  })

  t.deepEqual(analytics.getState('context.version'), 100)
})

test('Should contain debug', async (t) => {
  const analytics = Analytics({
    app: 'appname',
    version: 100,
    debug: true
  })

  t.deepEqual(analytics.getState('context.debug'), true)
})
