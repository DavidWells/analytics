import test from 'ava'
import analyticsLib, { init, Analytics, EVENTS, CONSTANTS } from './index'

test('default export is main function', (t) => {
  // default export is function
  t.is(typeof analyticsLib, 'function')
})

test('{ Analytics } export exists ', (t) => {
  t.is(typeof Analytics, 'function')
  // Default export and named are the same
  t.deepEqual(analyticsLib, Analytics)
})

test('{ EVENTS } export exists ', (t) => {
  t.is(typeof EVENTS, 'object')
  t.is(Array.isArray(EVENTS), false)
})

test('{ CONSTANTS } export exists ', (t) => {
  t.is(typeof CONSTANTS, 'object')
  t.is(Array.isArray(CONSTANTS), false)
})

test('{ init } export exists for stanalone browser', (t) => {
  t.is(typeof init, 'function')
  t.deepEqual(analyticsLib, init)
})

/* See api ref https://getanalytics.io/api/ */
test('Analytics should contain all API methods', (t) => {
  const analytics = analyticsLib({
    app: 'appname',
    version: 100
  })

  // Api methods should exist
  t.is(typeof analytics.identify, 'function')
  t.is(typeof analytics.track, 'function')
  t.is(typeof analytics.page, 'function')
  t.is(typeof analytics.getState, 'function')
  t.is(typeof analytics.reset, 'function')
  t.is(typeof analytics.dispatch, 'function')
  t.is(typeof analytics.storage, 'object')
  t.is(typeof analytics.storage.getItem, 'function')
  t.is(typeof analytics.storage.setItem, 'function')
  t.is(typeof analytics.storage.removeItem, 'function')
  t.is(typeof analytics.setAnonymousId, 'function')
  t.is(typeof analytics.user, 'function')
  t.is(typeof analytics.ready, 'function')
  t.is(typeof analytics.on, 'function')
  t.is(typeof analytics.once, 'function')
  t.is(typeof analytics.enablePlugin, 'function')
  t.is(typeof analytics.disablePlugin, 'function')
  // t.is(typeof analytics.loadPlugin, 'function') @TOOD implement
  t.is(typeof analytics.events, 'object')

  // Plugins should be empty
  t.deepEqual(analytics.getState('plugins'), {})
})
