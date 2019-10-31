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

  await analytics.reset()

  // Verify values are removed
  t.falsy(analytics.user('userId'))
  t.falsy(analytics.user('anonymousId'))
  t.deepEqual(analytics.user('traits'), {})
  t.falsy(analytics.user('traits.color'))
  t.falsy(analytics.user('traits.level'))

  // Set values again
  await analytics.identify('abc123', {
    level: 'basic',
    color: 'red'
  })

  t.is(analytics.user('userId'), 'abc123')
  t.is(analytics.user('traits.level'), 'basic')
  t.is(analytics.user('traits.color'), 'red')
})
