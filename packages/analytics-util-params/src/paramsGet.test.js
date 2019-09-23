import test from 'ava'
import getParam from './paramsGet'

test('Get single param no value', t => {
  let url = '?foo&bar[]=bar1&bar[]=bar2'
  let out = getParam('foo', url)
  t.is(out, '')
})

test('Get single param value', t => {
  let url = '?foo=zoo&bar[]=bar1&bar[]=bar2'
  let out = getParam('foo', url)
  t.is(out, 'zoo')
})

test('Get array param value', t => {
  let str = '?foo=foo&bar[]=bar1&bar[]=bar2'
  let out = getParam('bar', str)
  t.deepEqual(out, ['bar1', 'bar2'])
})

test('Use first param if multiple in url', t => {
  let str = '?foo=zoo&foo=ballon&zaz=true'
  let out = getParam('foo', str)
  t.deepEqual(out, 'zoo')
})
