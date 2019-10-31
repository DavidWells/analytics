import test from 'ava'
import sinon from 'sinon'
import delay from '../_utils/delay'
import isPromise from '../_utils/isPromise'
import Analytics from '../../src'

test.beforeEach((t) => {
  t.context.sandbox = sinon.createSandbox()
})

test('Reset returns promise', async (t) => {
  const analytics = Analytics({
    app: 'appname',
    version: 100
  })

  const promise = analytics.reset()
  t.is(isPromise(promise), true)
})

test('Reset callback is called', async (t) => {
  const callbackFunction = t.context.sandbox.spy()

  const analytics = Analytics({
    app: 'appname',
    version: 100
  })

  await analytics.reset(() => {
    callbackFunction()
  })

  t.is(callbackFunction.callCount, 1)
})

test('Reset resets the user data', async (t) => {
  const analytics = Analytics({
    app: 'appname',
    version: 100
  })

  const anonId = analytics.user('anonymousId')

  t.truthy(anonId)

  await analytics.identify('xyz-123', {
    name: 'bob'
  })

  const { userId, traits } = analytics.user()

  t.is(userId, 'xyz-123')
  t.deepEqual(traits, {
    name: 'bob'
  })

  // Reset the data
  await analytics.reset()

  // Reset clears anon Id
  const userData = analytics.user()
  t.falsy(userData.anonymousId)
  t.falsy(userData.userId)
  t.deepEqual(userData.traits, {})
})
