const test = require('ava').default
const analyticsLib = require('../src').default
const { Analytics, CONSTANTS, EVENTS, init } = require('../src')

test('CJS: const analyticsLib = require(\'../src\').default works', async (t) => {
  t.is(typeof analyticsLib, 'function')
})

test('CJS: const { Analytics } = require("analytics") works', async (t) => {
  t.is(typeof Analytics, 'function')
  // Default export and named are the same
  t.deepEqual(analyticsLib, Analytics)
  t.deepEqual(analyticsLib, init)
})

test('CJS: { EVENTS, CONSTANTS, init } export exists ', (t) => {
  t.is(typeof init, 'function')
  t.is(typeof EVENTS, 'object')
  t.is(Array.isArray(EVENTS), false)
  t.is(typeof CONSTANTS, 'object')
  t.is(Array.isArray(CONSTANTS), false)
})
