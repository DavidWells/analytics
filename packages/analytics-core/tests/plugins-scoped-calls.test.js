import test from 'ava'
import sinon from 'sinon'
import delay from './_utils/delay'
import Analytics from '../src'

/* Tests for single scoped calls
   https://getanalytics.io/tutorials/sending-provider-specific-events/
*/

test.beforeEach((t) => {
  t.context.sandbox = sinon.createSandbox()
})

test('No plugins get called if config.plugins.all set to false', async (t) => {
  const dummyOne = t.context.sandbox.spy()
  const dummyTwo = t.context.sandbox.spy()
  const dummyThree = t.context.sandbox.spy()

  const analytics = Analytics({
    app: 'appname',
    plugins: [
      {
        name: 'plugin-one',
        page: dummyOne,
        track: dummyTwo,
        identify: dummyThree
      },
      {
        name: 'plugin-two',
        page: dummyOne,
        track: dummyTwo,
        identify: dummyThree
      },
      {
        name: 'plugin-three',
        page: dummyOne,
        track: dummyTwo,
        identify: dummyThree
      },
    ]
  })

  const opts = {
    plugins: {
      // disable all plugins from sending data
      all: false,
    }
  }
  /* Send page call */
  analytics.page({}, opts)
  analytics.track('eventName', {}, opts)
  analytics.identify('userId-123', {}, opts)

  await delay(100)

  // Verify no plugin methods have been called
  t.is(dummyOne.callCount, 0)
  t.is(dummyTwo.callCount, 0)
  t.is(dummyThree.callCount, 0)
})

test('Single destination via config.plugins.all false works', async (t) => {
  const dummyOne = t.context.sandbox.spy()
  const dummyTwo = t.context.sandbox.spy()
  const dummyThree = t.context.sandbox.spy()
  const activePlugin = t.context.sandbox.spy()

  const analytics = Analytics({
    app: 'appname',
    plugins: [
      {
        name: 'plugin-one',
        page: dummyOne,
        track: dummyTwo,
        identify: dummyThree
      },
      {
        name: 'plugin-two',
        page: dummyOne,
        track: dummyTwo,
        identify: dummyThree
      },
      {
        name: 'plugin-three',
        page: activePlugin,
        track: activePlugin,
        identify: activePlugin
      },
    ]
  })

  const opts = {
    plugins: {
      // disable all plugins from sending data
      all: false,
      'plugin-three': true
    }
  }
  /* Send page call */
  analytics.page({}, opts)
  analytics.track('eventName', {}, opts)
  analytics.identify('userId-123', {}, opts)

  await delay(100)

  // Verify no plugin methods have been called
  t.is(dummyOne.callCount, 0)
  t.is(dummyTwo.callCount, 0)
  t.is(dummyThree.callCount, 0)
  t.is(activePlugin.callCount, 3)
})

test('Disable Single destination via config.plugins[name] false works', async (t) => {
  const dummyOne = t.context.sandbox.spy()
  const dummyTwo = t.context.sandbox.spy()
  const dummyThree = t.context.sandbox.spy()
  const disabledPlugin = t.context.sandbox.spy()

  const analytics = Analytics({
    app: 'appname',
    plugins: [
      {
        name: 'plugin-one',
        page: dummyOne,
        track: dummyTwo,
        identify: dummyThree
      },
      {
        name: 'plugin-two',
        page: dummyOne,
        track: dummyTwo,
        identify: dummyThree
      },
      {
        name: 'plugin-three',
        page: disabledPlugin,
        track: disabledPlugin,
        identify: disabledPlugin
      },
    ]
  })

  const opts = {
    plugins: {
      // disable just plugin-three
      'plugin-three': false
    }
  }
  /* Send page call */
  analytics.page({}, opts)
  analytics.track('eventName', {}, opts)
  analytics.identify('userId-123', {}, opts)

  await delay(100)

  // Verify no plugin methods have been called
  t.is(dummyOne.callCount, 2)
  t.is(dummyTwo.callCount, 2)
  t.is(dummyThree.callCount, 2)
  t.is(disabledPlugin.callCount, 0)
})

test('Multiple destinations works', async (t) => {
  const dummyOne = t.context.sandbox.spy()
  const dummyTwo = t.context.sandbox.spy()
  const dummyThree = t.context.sandbox.spy()
  const activePlugin = t.context.sandbox.spy()
  const activePluginTwo = t.context.sandbox.spy()


  const analytics = Analytics({
    app: 'appname',
    plugins: [
      {
        name: 'plugin-one',
        page: dummyOne,
        track: dummyTwo,
        identify: dummyThree
      },
      {
        name: 'plugin-two',
        page: activePlugin,
        track: activePlugin,
        identify: activePlugin
      },
      {
        name: 'plugin-three',
        page: activePluginTwo,
        track: activePluginTwo,
        identify: activePluginTwo
      },
      {
        name: 'plugin-four',
        page: dummyOne,
        track: dummyTwo,
        identify: dummyThree
      },
    ]
  })

  const opts = {
    plugins: {
      // disable all plugins from sending data
      all: false,
      'plugin-two': true,
      'plugin-three': true,
      'plugin-four': false
    }
  }
  /* Send page call */
  analytics.page({}, opts)
  analytics.track('eventName', {}, opts)
  analytics.identify('userId-123', {}, opts)

  await delay(100)

  // Verify no plugin methods have been called
  t.is(dummyOne.callCount, 0)
  t.is(dummyTwo.callCount, 0)
  t.is(dummyThree.callCount, 0)
  t.is(activePlugin.callCount, 3)
  t.is(activePluginTwo.callCount, 3)
})
