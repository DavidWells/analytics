/**
 * Test file for ThriveStack plugin
 */

import test from 'ava'
import sinon from 'sinon'
import { createScriptLoader } from '@analytics/script-loader'
import thriveStackPlugin from '../index'

// Stub the script loader
sinon.stub(createScriptLoader)

// Mock global window
global.window = {
  thrivestack: {
    init: sinon.spy(),
    page: sinon.spy(),
    track: sinon.spy(),
    identify: sinon.spy()
  }
}

// Plugin configuration for tests
const config = {
  apiKey: 'test-api-key',
  options: {
    debug: true
  }
}

// Create plugin for testing
const thriveStack = thriveStackPlugin(config)

test('ThriveStack plugin configuration', t => {
  t.is(thriveStack.name, 'thrivestack')
  t.deepEqual(thriveStack.config, {
    name: 'thrivestack',
    apiKey: 'test-api-key',
    options: {
      debug: true
    }
  })
})

test('ThriveStack plugin initialize method', t => {
  const analyticsSpy = {
    config: config,
    instance: {}
  }
  
  thriveStack.initialize(analyticsSpy)
  
  // Verify script loader was called
  t.true(createScriptLoader.called)
})

test('ThriveStack plugin page method', t => {
  const pagePayload = {
    properties: {
      url: '/test',
      title: 'Test Page'
    }
  }
  
  thriveStack.page({ payload: pagePayload })
  
  // Verify page was called with expected params
  t.true(global.window.thrivestack.page.calledOnce)
  t.true(global.window.thrivestack.page.calledWith(pagePayload.properties))
})

test('ThriveStack plugin track method', t => {
  const trackPayload = {
    event: 'test_event',
    properties: {
      value: 100,
      category: 'test'
    }
  }
  
  thriveStack.track({ payload: trackPayload })
  
  // Verify track was called with expected params
  t.true(global.window.thrivestack.track.calledOnce)
  t.true(global.window.thrivestack.track.calledWith(
    trackPayload.event, 
    trackPayload.properties
  ))
})

test('ThriveStack plugin identify method', t => {
  const identifyPayload = {
    userId: 'test-user-123',
    traits: {
      name: 'Test User',
      email: 'test@example.com'
    }
  }
  
  thriveStack.identify({ payload: identifyPayload })
  
  // Verify identify was called with expected params
  t.true(global.window.thrivestack.identify.calledOnce)
  t.true(global.window.thrivestack.identify.calledWith(
    identifyPayload.userId, 
    identifyPayload.traits
  ))
})

test('ThriveStack plugin loaded method', t => {
  // Should return true if window.thrivestack exists
  t.true(thriveStack.loaded())
  
  // Modify global for testing
  const original = global.window.thrivestack
  global.window.thrivestack = null
  
  // Should return false if window.thrivestack doesn't exist
  t.false(thriveStack.loaded())
  
  // Restore global
  global.window.thrivestack = original
})

test('ThriveStack plugin exposes API methods', t => {
  t.is(typeof thriveStack.methods.getEvents, 'function')
  t.is(typeof thriveStack.methods.getPageVisits, 'function')
  t.is(typeof thriveStack.methods.getUserData, 'function')
  t.is(typeof thriveStack.methods.getDashboardStats, 'function')
  t.is(typeof thriveStack.methods.getThriveStackInstance, 'function')
  
  // Test getThriveStackInstance
  const instance = thriveStack.methods.getThriveStackInstance()
  t.deepEqual(instance, global.window.thrivestack)
})