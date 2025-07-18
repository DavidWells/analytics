import '../_setup.js'
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import delay from '../_utils/delay.js'
import Analytics from '../../src/index.js'

test('analytics.user("userId") works', async () => {
  const analytics = Analytics({
    app: 'appname',
    version: 100
  })

  await analytics.identify('xyz123')
  
  const dotProp = analytics.user('userId')
  assert.is(dotProp, 'xyz123')
  const objectProp = analytics.user().userId
  assert.is(objectProp, 'xyz123')
  const shorthand = analytics.user('id')
  assert.is(shorthand, 'xyz123')
})

test('analytics.user() returns object', async () => {
  const analytics = Analytics({
    app: 'appname',
    version: 100
  })

  await analytics.identify('xyz123', {
    level: 'pro',
    color: 'blue'
  })
  
  const anonId = analytics.user('anonymousId')
  assert.is(analytics.user('userId'), 'xyz123')
  assert.is(analytics.user('traits.color'), 'blue')
  assert.is(analytics.user('traits.level'), 'pro')
  assert.equal(analytics.user(), {
    userId: 'xyz123',
    traits: {
      level: 'pro',
      color: 'blue'
    },
    anonymousId: anonId
  })
})

test('analytics.reset() clears user details', async () => {
  const analytics = Analytics({
    app: 'appname',
    version: 100
  })

  await analytics.identify('xyz123', {
    level: 'pro',
    color: 'blue'
  })

  // Verify initial values
  assert.is(analytics.user('userId'), 'xyz123')
  assert.is(analytics.user('traits.color'), 'blue')
  assert.is(analytics.user('traits.level'), 'pro')

  // const user = analytics.user()
  // console.log('before user', user)
  await analytics.reset()
  // console.log('after user', analytics.user())

  const userState = analytics.user()

  assert.not.ok(userState.userId)
  assert.not.ok(userState.anonymousId)
  /*
  console.log('userState userId', userState.userId)
  console.log('userState anonymousId', userState.anonymousId)
  /***/

  const state = analytics.getState()
  /*
  console.log('state userId', state.user.userId)
  console.log('state anonymousId', state.user.anonymousId)
  /** */
  assert.not.ok(state.user.userId)
  assert.not.ok(state.user.anonymousId)
  /** */
  // Verify values are removed
  const userId = analytics.user('userId')
  const anonymousId = analytics.user('anonymousId')

  /*
  console.log('userId', userId)
  console.log('anonymousId', anonymousId)
  /** */
 
  assert.not.ok(userId)
  assert.not.ok(anonymousId)
  assert.equal(analytics.user('traits'), {})
  assert.not.ok(analytics.user('traits.color'))
  assert.not.ok(analytics.user('traits.level'))

  

  // Set values again
  await analytics.identify('abc123', {
    level: 'basic',
    color: 'red'
  })

  assert.ok(analytics.user(anonymousId))
  assert.is(analytics.user('userId'), 'abc123')
  assert.is(analytics.user('traits.level'), 'basic')
  assert.is(analytics.user('traits.color'), 'red')
})

test.run()
