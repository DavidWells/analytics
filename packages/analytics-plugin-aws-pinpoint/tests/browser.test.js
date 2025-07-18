import { test } from 'uvu'
import * as assert from 'uvu/assert'
import sinon from 'sinon'
import * as bootstrap from '../src/utils/bootstrap.js'
import clientSide from '../src/browser.js'

test('should create pinpoint plugin for client', () => {
  sinon.stub(bootstrap, 'default').returns('bootstrap')
  const pluginConfig = {
    pinpointAppId: 'foo',
    getCredentials: {
      accessKeyId: 'id',
      secretAccessKey: 'secret',
    },
  }
  const plugin = clientSide(pluginConfig)

  assert.is(plugin.name, 'aws-pinpoint')
  assert.is(plugin.config.disableAnonymousTraffic, false)
  assert.is(plugin.config.pinpointRegion, 'us-east-1')
  assert.equal(plugin.config.eventMapping, {})
  assert.is(plugin.config.pinpointAppId, 'foo')
  assert.equal(plugin.config.getCredentials, {
    accessKeyId: 'id',
    secretAccessKey: 'secret',
  })
  assert.is(typeof plugin.bootstrap, 'function')
  assert.is(typeof plugin.initialize, 'function')
  assert.is(typeof plugin.track, 'function')
  assert.is(typeof plugin.identify, 'function')
  assert.is(typeof plugin.loaded, 'function')
})

test.run()
