import { test } from 'uvu'
import * as assert from 'uvu/assert'
import analyticsLib, { init, Analytics, EVENTS, CONSTANTS } from './index.js'

test('default export is main function', () => {
  // default export is function
  assert.is(typeof analyticsLib, 'function')
})

test('{ Analytics } export exists ', () => {
  assert.is(typeof Analytics, 'function')
  // Default export and named are the same
  assert.equal(analyticsLib, Analytics)
})

test('{ EVENTS } export exists ', () => {
  assert.is(typeof EVENTS, 'object')
  assert.is(Array.isArray(EVENTS), false)
})

test('{ CONSTANTS } export exists ', () => {
  assert.is(typeof CONSTANTS, 'object')
  assert.is(Array.isArray(CONSTANTS), false)
})

test('{ init } export exists for stanalone browser', () => {
  assert.is(typeof init, 'function')
  assert.equal(analyticsLib, init)
})

/* See api ref https://getanalytics.io/api/ */
test('Analytics should contain all API methods', () => {
  const analytics = analyticsLib({
    app: 'appname',
    version: 100
  })

  // Api methods should exist
  assert.is(typeof analytics.identify, 'function')
  assert.is(typeof analytics.track, 'function')
  assert.is(typeof analytics.page, 'function')
  assert.is(typeof analytics.getState, 'function')
  assert.is(typeof analytics.reset, 'function')
  assert.is(typeof analytics.dispatch, 'function')
  assert.is(typeof analytics.storage, 'object')
  assert.is(typeof analytics.storage.getItem, 'function')
  assert.is(typeof analytics.storage.setItem, 'function')
  assert.is(typeof analytics.storage.removeItem, 'function')
  assert.is(typeof analytics.setAnonymousId, 'function')
  assert.is(typeof analytics.user, 'function')
  assert.is(typeof analytics.ready, 'function')
  assert.is(typeof analytics.on, 'function')
  assert.is(typeof analytics.once, 'function')
  assert.is(typeof analytics.enablePlugin, 'function')
  assert.is(typeof analytics.disablePlugin, 'function')
  assert.is(typeof analytics.events, 'object')

  // Plugins should be empty
  assert.equal(analytics.getState('plugins'), {})
})

test.run()
