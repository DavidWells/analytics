import test from 'ava'
import delay from '../_utils/delay'
import Analytics from '../../src'

test.cb('analytics.user("userId") works', (t) => {
  const analytics = Analytics({
    app: 'appname',
    version: 100
  })

  analytics.identify('xyz123', () => {
    const dotProp = analytics.user('userId')
    t.is(dotProp, 'xyz123')
    const objectProp = analytics.user().userId
    t.is(objectProp, 'xyz123')
    const shorthand = analytics.user('id')
    t.is(shorthand, 'xyz123')
    t.end()
  })
})

test.cb('analytics.user() returns object', (t) => {
  const analytics = Analytics({
    app: 'appname',
    version: 100
  })

  analytics.identify('xyz123', {
    level: 'pro',
    color: 'blue'
  }, () => {
    const anonId = analytics.user('anonymousId')
    t.is(analytics.user('userId'), 'xyz123')
    t.is(analytics.user('traits.color'), 'blue')
    t.is(analytics.user('traits.level'), 'pro')
    t.deepEqual(analytics.user(), {
      userId: 'xyz123',
      traits: {
        level: 'pro',
        color: 'blue'
      },
      anonymousId: anonId
    })
    t.end()
  })
})

test('analytics.reset() clears user details', async (t) => {
  const analytics = Analytics({
    app: 'appname',
    version: 100
  })

  await analytics.identify('xyz123', {
    level: 'pro',
    color: 'blue'
  })

  // Verify initial values
  t.is(analytics.user('userId'), 'xyz123')
  t.is(analytics.user('traits.color'), 'blue')
  t.is(analytics.user('traits.level'), 'pro')

  // const user = analytics.user()
  // console.log('before user', user)
  await analytics.reset()
  // console.log('after user', analytics.user())

  const userState = analytics.user()

  t.falsy(userState.userId)
  t.falsy(userState.anonymousId)
  /*
  console.log('userState userId', userState.userId)
  console.log('userState anonymousId', userState.anonymousId)
  /***/

  const state = analytics.getState()
  /*
  console.log('state userId', state.user.userId)
  console.log('state anonymousId', state.user.anonymousId)
  /** */
  t.falsy(state.user.userId)
  t.falsy(state.user.anonymousId)
  /** */
  // Verify values are removed
  const userId = analytics.user('userId')
  const anonymousId = analytics.user('anonymousId')

  /*
  console.log('userId', userId)
  console.log('anonymousId', anonymousId)
  /** */
 
  t.falsy(userId)
  t.falsy(anonymousId)
  t.deepEqual(analytics.user('traits'), {})
  t.falsy(analytics.user('traits.color'))
  t.falsy(analytics.user('traits.level'))

  

  // Set values again
  await analytics.identify('abc123', {
    level: 'basic',
    color: 'red'
  })

  t.truthy(analytics.user(anonymousId))
  t.is(analytics.user('userId'), 'abc123')
  t.is(analytics.user('traits.level'), 'basic')
  t.is(analytics.user('traits.color'), 'red')
})
