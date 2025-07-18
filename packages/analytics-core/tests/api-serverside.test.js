import './_setup.js'
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import analyticsLib, { Analytics, CONSTANTS, EVENTS, init } from '../src/index.js'

test('CJS: const analyticsLib = require(\'../src\').default works', async () => {
  assert.is(typeof analyticsLib, 'function')
})

test('CJS: const { Analytics } = require("analytics") works', async () => {
  assert.is(typeof Analytics, 'function')
  // Default export and named are the same
  assert.equal(analyticsLib, Analytics)
  assert.equal(analyticsLib, init)
})

test('CJS: { EVENTS, CONSTANTS, init } export exists ', () => {
  assert.is(typeof init, 'function')
  assert.is(typeof EVENTS, 'object')
  assert.is(Array.isArray(EVENTS), false)
  assert.is(typeof CONSTANTS, 'object')
  assert.is(Array.isArray(CONSTANTS), false)
})

test.run()
