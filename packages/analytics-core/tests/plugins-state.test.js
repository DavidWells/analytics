import test from 'ava'
import sinon from 'sinon'
import delay from './_utils/delay'
import Analytics from '../src'

test.beforeEach((t) => {
  t.context.sandbox = sinon.createSandbox()
})

test('Instance should contain no plugins', async (t) => {
  const analytics = Analytics({
    app: 'appname',
    version: 100
  })
  const { plugins } = analytics.getState()

  t.is(Object.keys(plugins).length, 0)
})

test('Instance should contain 1 plugin', async (t) => {
  const analytics = Analytics({
    app: 'appname',
    version: 100,
    plugins: [
      {
        name: 'plugin-one',
        page: () => {}
      }
    ]
  })

  const { plugins } = analytics.getState()

  t.is(Object.keys(plugins).length, 1)
})

test('Instance should contain 2 plugins', async (t) => {
  const analytics = Analytics({
    app: 'appname',
    version: 100,
    plugins: [
      {
        name: 'plugin-one',
        page: () => {}
      },
      {
        name: 'plugin-two',
        page: () => {},
        config: {
          lol: 'nice'
        }
      }
    ]
  })

  const { plugins } = analytics.getState()

  t.is(Object.keys(plugins).length, 2)
  t.is(plugins['plugin-one'].enabled, true)
  t.is(plugins['plugin-two'].enabled, true)
  t.deepEqual(plugins['plugin-two'].config, {
    lol: 'nice'
  })
})

test.cb('Instance should load plugins in correct order', (t) => {
  const pluginOrder = []
  const initializeOne = t.context.sandbox.spy()
  const initializeTwo = t.context.sandbox.spy()
  const analytics = Analytics({
    app: 'appname',
    version: 100,
    plugins: [
      {
        name: 'plugin-one',
        initialize: () => {
          pluginOrder.push(1)
          initializeOne()
        }
      },
      {
        name: 'plugin-two',
        initialize: () => {
          pluginOrder.push(2)
          initializeTwo()
        }
      }
    ]
  })

  analytics.ready(() => {
    t.is(initializeOne.callCount, 1)
    t.is(initializeTwo.callCount, 1)
    t.deepEqual(pluginOrder, [1, 2])
    t.end()
  })
})
