const test = require('ava').default
const { Analytics } = require('../src')

test('const { Analytics } = require("analytics") works', async (t) => {
  const analytics = Analytics({
    app: 'appname',
    version: 100
  })

  t.is(typeof analytics.identify, 'function')
  t.is(typeof analytics.track, 'function')
  t.is(typeof analytics.page, 'function')
  t.is(typeof analytics.getState, 'function')
  t.is(typeof analytics.reset, 'function')
  t.is(typeof analytics.dispatch, 'function')
  t.is(typeof analytics.storage, 'object')
  t.is(typeof analytics.storage.getItem, 'function')
  t.is(typeof analytics.storage.setItem, 'function')
  t.is(typeof analytics.storage.removeItem, 'function')
  t.is(typeof analytics.setAnonymousId, 'function')
  t.is(typeof analytics.user, 'function')
  t.is(typeof analytics.ready, 'function')
  t.is(typeof analytics.on, 'function')
  t.is(typeof analytics.once, 'function')
  t.is(typeof analytics.enablePlugin, 'function')
  t.is(typeof analytics.disablePlugin, 'function')
  t.is(typeof analytics.loadPlugin, 'function')
  t.is(typeof analytics.events, 'object')
})
