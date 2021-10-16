import test from 'ava'
import getOs from '../../../src/utils/client-info/get-os'

test('should return default undefined os name and version', (t) => {
  global.window = {
    navigator: {
      userAgent: 'user agent',
    },
  }
  const os = getOs()

  t.is(os.NAME, undefined)
  t.is(os.VERSION, undefined)
})

test('should map userAgent', (t) => {
  global.window = {
    navigator: {
      userAgent: 'Mac OS X 11_6_1'
    }
  }
  const os = getOs(window.navigator.userAgent)
  
  t.is(os.name, 'MacOS')
  t.is(os.version, '11.6.1')
})