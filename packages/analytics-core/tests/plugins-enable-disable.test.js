import test from 'ava'
import sinon from 'sinon'
import delay from './_utils/delay'
import Analytics from '../src'

test.beforeEach((t) => {
  t.context.sandbox = sinon.createSandbox()
})

test('Plugin enabled: false disables plugin', async (t) => {
  const { context } = t
  const spyInitOne = context.sandbox.spy()
  const spyInitTwo = context.sandbox.spy()
  const spyInitThree = context.sandbox.spy()
  const spyInitFour = context.sandbox.spy()
  const spyPageOne = context.sandbox.spy()
  const spyPageTwo = context.sandbox.spy()
  const spyPageThree = context.sandbox.spy()
  const spyPageFour = context.sandbox.spy()

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
  t.is(pluginState['plugin-1'].enabled, true)
  t.is(pluginState['plugin-2'].enabled, false)
  t.is(pluginState['plugin-3'].enabled, true)
  t.is(pluginState['plugin-4'].enabled, false)

  analytics.page()

  await delay(2000)

  t.is(spyInitOne.callCount, 1)
  t.is(spyInitTwo.callCount, 0)
  t.is(spyInitThree.callCount, 1)
  t.is(spyInitFour.callCount, 0)
  t.is(spyPageOne.callCount, 1)
  t.is(spyPageTwo.callCount, 0)
  t.is(spyPageThree.callCount, 1)
  t.is(spyPageFour.callCount, 0)
})

test('analytics.plugins.enable("plugin") works', async (t) => {
  const { context } = t
  const spyInitOne = context.sandbox.spy()
  const spyInitTwo = context.sandbox.spy()
  const spyInitThree = context.sandbox.spy()
  const spyInitFour = context.sandbox.spy()
  const spyPageOne = context.sandbox.spy()
  const spyPageTwo = context.sandbox.spy()
  const spyPageThree = context.sandbox.spy()
  const spyPageFour = context.sandbox.spy()

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
  t.is(pluginState['plugin-1'].enabled, true)
  t.is(pluginState['plugin-2'].enabled, false)
  t.is(pluginState['plugin-3'].enabled, true)
  t.is(pluginState['plugin-4'].enabled, false)

  analytics.page()

  await analytics.plugins.enable('plugin-2', (info) => {
    console.log('analytics.plugins.enable callbackxx', info)
    analytics.page()
  })

  const updatedPluginState = analytics.getState('plugins')
  t.is(updatedPluginState['plugin-2'].enabled, true)
  t.is(updatedPluginState['plugin-4'].enabled, false)

  await analytics.plugins.enable('plugin-4').then((info) => {
    console.log('analytics.plugins.enable promise', info)
    return analytics.page()
  })

  const lastPluginState = analytics.getState('plugins')
  t.is(lastPluginState['plugin-1'].enabled, true)
  t.is(lastPluginState['plugin-2'].enabled, true)
  t.is(lastPluginState['plugin-3'].enabled, true)
  t.is(lastPluginState['plugin-4'].enabled, true)

  // init should only be called once ever
  t.is(spyInitOne.callCount, 1)
  t.is(spyInitTwo.callCount, 1)
  t.is(spyInitThree.callCount, 1)
  t.is(spyInitFour.callCount, 1)

  t.is(spyPageOne.callCount, 3)
  t.is(spyPageTwo.callCount, 2)
  t.is(spyPageThree.callCount, 3)
  t.is(spyPageFour.callCount, 1)
})


test('analytics.plugins.disable("plugin") works', async (t) => {
  const { context } = t
  const spyInitOne = context.sandbox.spy()
  const spyInitTwo = context.sandbox.spy()
  const spyInitThree = context.sandbox.spy()
  const spyInitFour = context.sandbox.spy()
  const spyPageOne = context.sandbox.spy()
  const spyPageTwo = context.sandbox.spy()
  const spyPageThree = context.sandbox.spy()
  const spyPageFour = context.sandbox.spy()

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
  t.is(pluginState['plugin-2'].enabled, false)

  await analytics.page() 

  // init should only be called once ever
  t.is(spyInitOne.callCount, 1)
  t.is(spyInitTwo.callCount, 1)
  t.is(spyInitThree.callCount, 1)
  t.is(spyInitFour.callCount, 1)

  t.is(spyPageOne.callCount, 2)
  t.is(spyPageTwo.callCount, 1)
  t.is(spyPageThree.callCount, 2)
  t.is(spyPageFour.callCount, 2)
})