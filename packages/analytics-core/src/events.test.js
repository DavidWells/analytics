import { test } from 'uvu'
import * as assert from 'uvu/assert'
import EVENTS, { coreEvents, nonEvents, isReservedAction } from './events.js'

test('nonEvents should contain all non events keys as array', () => {
  assert.equal(nonEvents, ['name', 'EVENTS', 'config', 'loaded'])
})

test('coreEvents should contain all events as array', () => {
  assert.equal(coreEvents, [
    'bootstrap',
    'params',
    'campaign',
    'initializeStart',
    'initialize',
    'initializeEnd',
    'ready',
    'resetStart',
    'reset',
    'resetEnd',
    'pageStart',
    'page',
    'pageEnd',
    'pageAborted',
    'trackStart',
    'track',
    'trackEnd',
    'trackAborted',
    'identifyStart',
    'identify',
    'identifyEnd',
    'identifyAborted',
    'userIdChanged',
    'registerPlugins',
    'enablePlugin',
    'disablePlugin',
    // 'loadPlugin',
    'online',
    'offline',
    'setItemStart',
    'setItem',
    'setItemEnd',
    'setItemAborted',
    'removeItemStart',
    'removeItem',
    'removeItemEnd',
    'removeItemAborted'
  ])
})

test('EVENTS should contain all events', () => {
  const clonedEvents = Object.assign({}, EVENTS)
  delete clonedEvents.registerPluginType
  delete clonedEvents.pluginReadyType
  assert.equal(clonedEvents, {
    bootstrap: 'bootstrap',
    params: 'params',
    campaign: 'campaign',
    initializeStart: 'initializeStart',
    initialize: 'initialize',
    initializeEnd: 'initializeEnd',
    ready: 'ready',
    resetStart: 'resetStart',
    reset: 'reset',
    resetEnd: 'resetEnd',
    pageStart: 'pageStart',
    page: 'page',
    pageEnd: 'pageEnd',
    pageAborted: 'pageAborted',
    trackStart: 'trackStart',
    track: 'track',
    trackEnd: 'trackEnd',
    trackAborted: 'trackAborted',
    identifyStart: 'identifyStart',
    identify: 'identify',
    identifyEnd: 'identifyEnd',
    identifyAborted: 'identifyAborted',
    userIdChanged: 'userIdChanged',
    registerPlugins: 'registerPlugins',
    enablePlugin: 'enablePlugin',
    disablePlugin: 'disablePlugin',
    // loadPlugin: 'loadPlugin', @todo implement
    online: 'online',
    offline: 'offline',
    setItemStart: 'setItemStart',
    setItem: 'setItem',
    setItemEnd: 'setItemEnd',
    setItemAborted: 'setItemAborted',
    removeItemStart: 'removeItemStart',
    removeItem: 'removeItem',
    removeItemEnd: 'removeItemEnd',
    removeItemAborted: 'removeItemAborted'
  })
})

test('registerPluginType generates action names correctly', () => {
  assert.is(EVENTS.registerPluginType('abc'), `registerPlugin:abc`)
  assert.is(EVENTS.registerPluginType('xyz'), `registerPlugin:xyz`)
})

test('pluginReadyType generates action names correctly', () => {
  assert.is(EVENTS.pluginReadyType('abc'), `ready:abc`)
  assert.is(EVENTS.pluginReadyType('xyz'), `ready:xyz`)
})

test('isReservedAction blocked reserved action names', () => {
  assert.is(isReservedAction('page'), true)
})

test('isReservedAction allowed other action names', () => {
  assert.is(isReservedAction('random-event'), false)
})

test.run()
