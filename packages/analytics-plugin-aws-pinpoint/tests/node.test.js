import test from 'ava'
import sinon from 'sinon'
import * as bootstrap from '../src/utils/bootstrap'
import serverSide from '../src/node'

test('should create pinpoint plugin for server', (t) => {
  const pluginConfig = {
    pinpointAppId: 'foo',
    getCredentials: {
      accessKeyId: 'id',
      secretAccessKey: 'secret',
    },
  }
  const plugin = serverSide(pluginConfig)
  
  t.is(plugin.name, 'aws-pinpoint')
  t.false(plugin.config.disableAnonymousTraffic)
  t.is(plugin.config.pinpointRegion, 'us-east-1')
  t.deepEqual(plugin.config.eventMapping, {})
  t.is(plugin.config.pinpointAppId, 'foo')
  t.deepEqual(plugin.config.getCredentials, {
    accessKeyId: 'id',
    secretAccessKey: 'secret',
  })
  t.is(typeof plugin.bootstrap, 'function')
  t.is(typeof plugin.initialize, 'function')
  t.is(typeof plugin.track, 'function')
  t.is(typeof plugin.identify, 'function')
  t.is(typeof plugin.loaded, 'function')
})
