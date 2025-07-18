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

test('Plugin enabled: false disables plugin', async () => {
  const spyInitOne = sandbox.spy()
  const spyInitTwo = sandbox.spy()
  const spyInitThree = sandbox.spy()
  const spyInitFour = sandbox.spy()
  const spyPageOne = sandbox.spy()
  const spyPageTwo = sandbox.spy()
  const spyPageThree = sandbox.spy()
  const spyPageFour = sandbox.spy()

  const analytics = Analytics({
    debug: 'hi',
    app: 'yolo',
    plugins: [
      {
        name: 'plugin-1',
        initialize: spyInitOne,
        page: spyPageOne,
      },
      {
        name: 'plugin-2',
        enabled: false,
        initialize: spyInitTwo,
        page: spyPageTwo,
      },
      {
        name: 'plugin-3',
        initialize: spyInitThree,
        page: spyPageThree,
      },
      {
        name: 'plugin-4',
        enabled: false,
        initialize: spyInitFour,
        page: spyPageFour
      },
    ]
  })

  const pluginState = analytics.getState('plugins')
  assert.is(pluginState['plugin-1'].enabled, true)
  assert.is(pluginState['plugin-2'].enabled, false)
  assert.is(pluginState['plugin-3'].enabled, true)
  assert.is(pluginState['plugin-4'].enabled, false)

  analytics.page()

  await delay(2000)

  assert.is(spyInitOne.callCount, 1)
  assert.is(spyInitTwo.callCount, 0)
  assert.is(spyInitThree.callCount, 1)
  assert.is(spyInitFour.callCount, 0)
  assert.is(spyPageOne.callCount, 1)
  assert.is(spyPageTwo.callCount, 0)
  assert.is(spyPageThree.callCount, 1)
  assert.is(spyPageFour.callCount, 0)
})

test('analytics.plugins.enable("plugin") works', async () => {
  const spyInitOne = sandbox.spy()
  const spyInitTwo = sandbox.spy()
  const spyInitThree = sandbox.spy()
  const spyInitFour = sandbox.spy()
  const spyPageOne = sandbox.spy()
  const spyPageTwo = sandbox.spy()
  const spyPageThree = sandbox.spy()
  const spyPageFour = sandbox.spy()

  const analytics = Analytics({
    debug: 'hi',
    app: 'yolo',
    plugins: [
      {
        name: 'plugin-1',
        initialize: spyInitOne,
        page: () => {
          console.log('spy one')
          spyPageOne()
        },
      },
      {
        name: 'plugin-2',
        enabled: false,
        initialize: spyInitTwo,
        page: spyPageTwo,
      },
      {
        name: 'plugin-3',
        initialize: spyInitThree,
        page: () => {
          console.log('spy three')
          spyPageThree()
        }
      },
      {
        name: 'plugin-4',
        enabled: false,
        initialize: spyInitFour,
        page: () => {
          console.log('spy four')
          spyPageFour()
        }
      },
    ]
  })

  const pluginState = analytics.getState('plugins')
  assert.is(pluginState['plugin-1'].enabled, true)
  assert.is(pluginState['plugin-2'].enabled, false)
  assert.is(pluginState['plugin-3'].enabled, true)
  assert.is(pluginState['plugin-4'].enabled, false)

  analytics.page()

  await analytics.plugins.enable('plugin-2', (info) => {
    console.log('analytics.plugins.enable callbackxx', info)
    analytics.page()
  })

  const updatedPluginState = analytics.getState('plugins')
  assert.is(updatedPluginState['plugin-2'].enabled, true)
  assert.is(updatedPluginState['plugin-4'].enabled, false)

  await analytics.plugins.enable('plugin-4').then((info) => {
    console.log('analytics.plugins.enable promise', info)
    return analytics.page()
  })

  const lastPluginState = analytics.getState('plugins')
  assert.is(lastPluginState['plugin-1'].enabled, true)
  assert.is(lastPluginState['plugin-2'].enabled, true)
  assert.is(lastPluginState['plugin-3'].enabled, true)
  assert.is(lastPluginState['plugin-4'].enabled, true)

  // init should only be called once ever
  assert.is(spyInitOne.callCount, 1)
  assert.is(spyInitTwo.callCount, 1)
  assert.is(spyInitThree.callCount, 1)
  assert.is(spyInitFour.callCount, 1)

  assert.is(spyPageOne.callCount, 3)
  assert.is(spyPageTwo.callCount, 2)
  assert.is(spyPageThree.callCount, 3)
  assert.is(spyPageFour.callCount, 1)
})


test('analytics.plugins.disable("plugin") works', async () => {
  const spyInitOne = sandbox.spy()
  const spyInitTwo = sandbox.spy()
  const spyInitThree = sandbox.spy()
  const spyInitFour = sandbox.spy()
  const spyPageOne = sandbox.spy()
  const spyPageTwo = sandbox.spy()
  const spyPageThree = sandbox.spy()
  const spyPageFour = sandbox.spy()

  const analytics = Analytics({
    debug: 'hi',
    app: 'yolo',
    plugins: [
      {
        name: 'plugin-1',
        initialize: spyInitOne,
        page: () => {
          spyPageOne()
        },
      },
      {
        name: 'plugin-2',
        initialize: spyInitTwo,
        page: spyPageTwo,
      },
      {
        name: 'plugin-3',
        initialize: spyInitThree,
        page: () => {
          spyPageThree()
        }
      },
      {
        name: 'plugin-4',
        initialize: spyInitFour,
        page: () => {
          spyPageFour()
        }
      },
    ]
  })

  analytics.page()

  await analytics.plugins.disable('plugin-2')

  const pluginState = analytics.getState('plugins')
  assert.is(pluginState['plugin-2'].enabled, false)

  await analytics.page() 

  // init should only be called once ever
  assert.is(spyInitOne.callCount, 1)
  assert.is(spyInitTwo.callCount, 1)
  assert.is(spyInitThree.callCount, 1)
  assert.is(spyInitFour.callCount, 1)

  assert.is(spyPageOne.callCount, 2)
  assert.is(spyPageTwo.callCount, 1)
  assert.is(spyPageThree.callCount, 2)
  assert.is(spyPageFour.callCount, 2)
})

test.run()