import test from 'ava'
import sinon from 'sinon'
import browserClientInfo from '../../../src/utils/client-info'

test('should return empty object if window is undefined', (t) => {
  const info = browserClientInfo()

  t.deepEqual(info, {})
})

test('should return empty object if window.navigator is undefined', (t) => {
  global.window = {
    location: 'location',
  }
  const info = browserClientInfo()

  t.deepEqual(info, {})
})

test('should return valid client info', (t) => {
  global.window = {
    location: 'location',
    navigator: {
      userAgent: '(Mac OS X 8_8_8) Edge/50',
      language: 'test_lang',
    },
  }
  const info = browserClientInfo()

  t.is(info.platform, undefined)
  t.deepEqual(info.os, { name: 'MacOS', version: '8.8.8' })
  t.is(info.make, undefined)
  t.is(info.model, 'Edge')
  t.is(info.version, '50')
  t.is(info.name, 'Edge/50')
  t.is(info.language, 'test_lang')
})
