import './_setup.js'
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import sinon from 'sinon'
import delay from './_utils/delay.js'
import Analytics from '../src/index.js'

let sandbox

test.before(() => {
  sandbox = sinon.createSandbox()
})

test('Instance should contain no plugins', async () => {
  const analytics = Analytics({
    app: 'appname',
    version: 100
  })
  const { plugins } = analytics.getState()

  assert.is(Object.keys(plugins).length, 0)
})

test('Instance should contain 1 plugin', async () => {
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

  assert.is(Object.keys(plugins).length, 1)
})

test('Instance should contain 2 plugins', async () => {
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

  assert.is(Object.keys(plugins).length, 2)
  assert.is(plugins['plugin-one'].enabled, true)
  assert.is(plugins['plugin-two'].enabled, true)
  assert.equal(plugins['plugin-two'].config, {
    lol: 'nice'
  })
})

test('Instance should load plugins in correct order', async () => {
  const pluginOrder = []
  const initializeOne = sandbox.spy()
  const initializeTwo = sandbox.spy()
  const analytics = Analytics({
    app: 'appname',
    version: 100,
    plugins: [
      {
        name: 'plugin-one',
        initialize: () => {
          console.log('initializeOne')
          pluginOrder.push(1)
          initializeOne()
        }
      },
      {
        name: 'plugin-two',
        initialize: () => {
          console.log('initializeTwo')
          pluginOrder.push(2)
          initializeTwo()
        }
      }
    ]
  })

  analytics.ready((x) => {
    assert.is(initializeOne.callCount, 1, 'initializeOne should be called')
    assert.is(initializeTwo.callCount, 1, 'initializeTwo should be called')
    assert.equal(pluginOrder, [1, 2])
  })
})

test.run()
