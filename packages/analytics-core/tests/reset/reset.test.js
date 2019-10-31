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

  const anonId = analytics.user('anonymousId')

  t.truthy(anonId)

  await analytics.reset(() => {
    callbackFunction()
  })
  t.is(callbackFunction.callCount, 1)
})
