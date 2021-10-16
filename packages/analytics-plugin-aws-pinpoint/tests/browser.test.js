import test from 'ava'
import sinon from 'sinon'
import * as index from '../src/pinpoint'
import clientSide from '../src/browser'
import * as boot from '../src/utils/bootstrap'
import * as formatEventData from '../src/utils/format-event-data'
import * as utils from '@analytics/session-utils'

let pluginInitializeStub
let formatEventDataStub
let recordEventFake = sinon.fake()
let removeItemFake = sinon.fake()

test.beforeEach(() => {
  pluginInitializeStub = sinon.stub(index, 'initialize').returns({
    recordEvent: recordEventFake,
  })
  formatEventDataStub = sinon
    .stub(formatEventData, 'default')
    .returns()
  sinon.stub(utils, 'getSession').returns()
  global.document = {}
  global.window = {}
  global.storage = {
    removeItem: removeItemFake,
  }
})

test.afterEach(() => {
  // sinon.resetHistory doesn't work for this fake
  recordEventFake.resetHistory()
  sinon.restore()
})

const pluginConfig = {
  pinpointAppId: 'foo',
  getCredentials: {
    accessKeyId: 'id',
    secretAccessKey: 'secret',
  },
}
const initializeConfig = {
  config: {
    disableAnonymousTraffic: false,
    debug: false,
  },
  instance: {
    getState: sinon.fake.returns({
      context: {
        app: 'app',
        version: 'version',
        campaign: 'campaign',
      },
    }),
  },
}

test('should create pinpoint plugin for clientside', (t) => {
  sinon.stub(boot, 'default').returns('bootstrap')
  const {
    name,
    bootstrap,
    initialize,
    page,
    track,
    identify,
    reset,
    loaded,
    config: {
      disableAnonymousTraffic,
      pinpointRegion,
      eventMapping,
      pinpointAppId,
      getCredentials,
    },
  } = clientSide(pluginConfig)

  t.is(name, 'aws-pinpoint')
  t.false(disableAnonymousTraffic)
  t.is(pinpointRegion, 'us-east-1')
  t.deepEqual(eventMapping, {})
  t.is(pinpointAppId, 'foo')
  t.deepEqual(getCredentials, {
    accessKeyId: 'id',
    secretAccessKey: 'secret',
  })
  t.is(bootstrap, 'bootstrap')
  t.is(typeof initialize, 'function')
  t.is(typeof page, 'function')
  t.is(typeof track, 'function')
  t.is(typeof identify, 'function')
  t.is(typeof reset, 'function')
  t.is(typeof loaded, 'function')
})

test('should load pinpoint if initialize is called', () => {
  const plugin = clientSide(pluginConfig)
  const response = plugin.initialize(initializeConfig)

  sinon.assert.calledOnce(pluginInitializeStub)
})

test('should return false if initialize is called with userId undefined and disableAnonymousTraffic true', (t) => {
  const initializeConfig = {
    config: {
      disableAnonymousTraffic: true,
      debug: false,
    },
    instance: {
      getState: sinon.fake.returns({
        user: {
          userId: undefined,
          anonymousId: undefined,
        },
      }),
    },
  }
  const plugin = clientSide(pluginConfig)
  const response = plugin.initialize(initializeConfig)
  
  t.is(response, false)
})

test('should throw error if page called with empty recordEvent', (t) => {
  const plugin = clientSide(pluginConfig)
  const error = t.throws(
    () => {
      plugin.page({})
    },
    { instanceOf: Error }
  )

  t.is(error.message, 'Pinpoint not loaded')
})

test('should call recordEvent if page is called', () => {
  const plugin = clientSide(pluginConfig)
  const response = plugin.initialize(initializeConfig)
  plugin.page({})

  sinon.assert.calledOnce(recordEventFake)
})

test('should throw error if track is called with empty recordEvent', (t) => {
  const plugin = clientSide(pluginConfig)
  const error = t.throws(
    () => {
      plugin.track({})
    },
    { instanceOf: Error }
  )

  t.is(error.message, 'Pinpoint not loaded')
})

test('should return undefined if track is called with disableAnonymousTraffic true and userId undefined', (t) => {
  const plugin = clientSide(pluginConfig)
  const response = plugin.initialize(initializeConfig)
  const data = plugin.track({
    payload: {
      userId: undefined,
    },
    config: {
      disableAnonymousTraffic: true,
    },
  })

  t.is(data, undefined)
})

test('should call formatEventData and recordEvent if track is called successfully', () => {
  const plugin = clientSide(pluginConfig)
  const response = plugin.initialize(initializeConfig)
  const data = plugin.track({
    payload: {
      userId: 'userId',
    },
    config: {
      disableAnonymousTraffic: false,
    },
  })

  sinon.assert.calledOnce(recordEventFake)
  sinon.assert.calledOnce(formatEventDataStub)
})

test('should throw error if identify is called with updateEndpoint undefined', (t) => {
  const plugin = clientSide(pluginConfig)
  const response = plugin.initialize(initializeConfig)

  const error = t.throws(
    () => {
      plugin.identify({
        payload: {
          userId: {
            UserId: 'UserId',
          },
        },
      })
    },
    { instanceOf: Error }
  )

  t.is(error.message, 'Pinpoint not loaded')
})

test('should call updateEndpoint if identify is called', () => {
  const plugin = clientSide(pluginConfig)
  const updateEndpointFake = sinon.fake()
  pluginInitializeStub.returns({
    recordEvent: recordEventFake,
    updateEndpoint: updateEndpointFake,
  })
  const response = plugin.initialize(initializeConfig)
  const data = plugin.identify({
    payload: {
      userId: {
        UserId: 'UserId',
      },
    },
  })

  sinon.assert.calledOnce(updateEndpointFake)
})

test('should reset/remove user details from local storage if reset is called', () => {
  const plugin = clientSide(pluginConfig)
  const response = plugin.initialize(initializeConfig)
  const getStorageKeyStub = sinon.stub(index, 'getStorageKey').returns('key')
  const data = plugin.reset({
    instance: {
      user: sinon.fake.returns(),
    },
  })

  sinon.assert.calledOnce(removeItemFake)
})

test('should return true if loaded is called with pinpoint initialized', (t) => {
  const plugin = clientSide(pluginConfig)
  const response = plugin.initialize(initializeConfig)

  t.is(plugin.loaded(), true)
})

test('should return false if loaded is called with pinpoint not initialized', (t) => {
  const plugin = clientSide(pluginConfig)

  t.is(plugin.loaded(), false)
})
