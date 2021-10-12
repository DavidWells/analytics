import test from 'ava'
import sinon from 'sinon'
import * as initialize from '../src/pinpoint'
import clientSide from '../src/browser'
import * as bootstrap from '../src/utils/bootstrap'

test('should create pinpoint plugin', (t) => {
  const bootstrapStub = sinon.stub(bootstrap, 'default').returns('bootstrap')
  const initializeStub = sinon.stub(initialize, 'initialize').returns('initialize')
  const pluginConfig = {
    pinpointAppId: 'foo',
    getCredentials: {
      accessKeyId: 'id',
      secretAccessKey: 'secret',
    },
  }

  const plugin = clientSide(pluginConfig)
  t.is(plugin.name, 'aws-pinpoint')
  t.false(plugin.config.disableAnonymousTraffic)
  t.is(plugin.config.pinpointRegion, 'us-east-1')
  t.deepEqual(plugin.config.eventMapping, {})
  t.is(plugin.config.pinpointAppId, 'foo')
  t.deepEqual(plugin.config.getCredentials, {
    accessKeyId: 'id',
    secretAccessKey: 'secret',
  })
  t.is(plugin.bootstrap, 'bootstrap')
  console.log(plugin)
})

// name: 'aws-pinpoint',
// config: {
// disableAnonymousTraffic: false,
// pinpointRegion: 'us-east-1',
// eventMapping: {},
// pinpointAppId: 'foo',
// getCredentials: { accessKeyId: 'id', secretAccessKey: 'secret' }
// },
// bootstrap: undefined,
// initialize: [Function: initialize],
// page: [Function: page],
// track: [Function: track],
// identify: [Function: identify],
// reset: [Function: reset],
// loaded: [Function: loaded]
