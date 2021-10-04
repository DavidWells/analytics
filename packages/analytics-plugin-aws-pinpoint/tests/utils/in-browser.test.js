import test from 'ava'
import inBrowser from '../../src/utils/in-browser'

test('should return false in node', (t) => {
  t.is(inBrowser, false)
})
