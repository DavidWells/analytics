import test from 'ava'

import ls from '../src/browser'

test('should create livesession client', (t) => {
  const pluginConfig = {
    keystrokes: true,
  }

  const plugin = ls("test", pluginConfig)

  t.is(plugin.name, 'livesession')
  t.deepEqual(plugin.config.trackId, "test")
  t.deepEqual(plugin.config.keystrokes, true)

  t.is(typeof plugin.initialize, 'function')
  t.is(typeof plugin.track, 'function')
  t.is(typeof plugin.identify, 'function')
  t.is(typeof plugin.loaded, 'function')
})
