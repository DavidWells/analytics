import test from 'ava'
import delay from './utils/delay'
import Analytics from '../src'

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

test.cb('analytics.user("userId") with traits works', (t) => {
  const analytics = Analytics({
    app: 'appname',
    version: 100
  })

  analytics.identify('xyz123', {
    level: 'pro',
    color: 'blue'
  }, () => {
    t.is(analytics.user('userId'), 'xyz123')
    t.is(analytics.user('traits.color'), 'blue')
    t.is(analytics.user('traits.level'), 'pro')
    t.end()
  })
})
