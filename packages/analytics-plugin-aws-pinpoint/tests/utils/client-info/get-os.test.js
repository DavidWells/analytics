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
