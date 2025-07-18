import '../_setup.js'
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import sinon from 'sinon'
import delay from '../_utils/delay.js'
import isPromise from '../_utils/isPromise.js'
import Analytics from '../../src/index.js'

let sandbox

test.before(() => {
  sandbox = sinon.createSandbox()
})

test('Reset returns promise', async () => {
  const analytics = Analytics({
    app: 'appname',
    version: 100
  })

  const promise = analytics.reset()
  assert.is(isPromise(promise), true)
})

test('Reset callback is called', async () => {
  const callbackFunction = sandbox.spy()

  const analytics = Analytics({
    app: 'appname',
    version: 100
  })

  await analytics.reset(() => {
    callbackFunction()
  })

  assert.is(callbackFunction.callCount, 1)
})

test('Reset resets the user data', async () => {
  const analytics = Analytics({
    app: 'appname',
    version: 100
  })

  const anonId = analytics.user('anonymousId')

  assert.ok(anonId)

  await analytics.identify('xyz-123', {
    name: 'bob'
  })

  const { userId, traits } = analytics.user()

  assert.is(userId, 'xyz-123')
  assert.equal(traits, {
    name: 'bob'
  })

  // Reset the data
  await analytics.reset()

  // Reset clears anon Id
  const userData = analytics.user()
  assert.not.ok(userData.anonymousId)
  assert.not.ok(userData.userId)
  assert.equal(userData.traits, {})
})

test.run()
