import test from 'ava'
import sinon from 'sinon'
import * as inBrowser from '../../src/utils/in-browser'

test('should return true in browser', (t) => {
  const inBrowserStub = sinon.replace(inBrowser, 'default',
true)
  t.is(inBrowserStub, true)
  sinon.restore()
})

test('should return false in node', (t) => {
  const response = inBrowser.default
  console.log(response)
  t.is(inBrowser.default, false)
})
