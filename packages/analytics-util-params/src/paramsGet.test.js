import { test } from 'uvu'
import * as assert from 'uvu/assert'
import getParam from './paramsGet.js'

test('Get single param no value', () => {
  let url = '?foo&bar[]=bar1&bar[]=bar2'
  let out = getParam('foo', url)
  assert.is(out, '')
})

test('Get single param value', () => {
  let url = '?foo=zoo&bar[]=bar1&bar[]=bar2'
  let out = getParam('foo', url)
  assert.is(out, 'zoo')
})

test('Get array param value', () => {
  let str = '?foo=foo&bar[]=bar1&bar[]=bar2'
  let out = getParam('bar', str)
  assert.equal(out, ['bar1', 'bar2'])
})

test('Use first param if multiple in url', () => {
  let str = '?foo=zoo&foo=ballon&zaz=true'
  let out = getParam('foo', str)
  assert.equal(out, 'zoo')
})

test.run()
