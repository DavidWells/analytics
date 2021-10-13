import test from 'ava'
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

  const { platform, os, make, model, version, name, language } = info

  t.is(platform, undefined)
  t.deepEqual(os, { name: 'MacOS', version: '8.8.8' })
  t.is(make, undefined)
  t.is(model, 'Edge')
  t.is(version, '50')
  t.is(name, 'Edge/50')
  t.is(language, 'test_lang')
})
