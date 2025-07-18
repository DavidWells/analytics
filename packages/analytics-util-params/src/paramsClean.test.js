import { test } from 'uvu'
import * as assert from 'uvu/assert'
import cleanParam from './paramsClean.js'

test('Clean single param value', () => {
  let str = '?foo=zoo&bar[]=bar1&bar[]=bar2'
  let out = cleanParam('foo', str)
  assert.is(out, '?bar[]=bar1&bar[]=bar2')
})

test('Remove all instance of string match', () => {
  let str = '?foo=zoo&bar[]=bar1&bar[]=bar2'
  let out = cleanParam('bar[]', str)
  console.log('out', out)
  assert.is(out, '?foo=zoo')
})

test('Remove utm_medium', () => {
  let str = '?utm_source=the_source&utm_medium=camp%20med&utm_term=Bought%20keyword&utm_content=Funny%20Text&utm_campaign=400kpromo'
  let out = cleanParam('utm_medium', str)
  console.log('out', out)
  assert.is(out, '?utm_source=the_source&utm_term=Bought%20keyword&utm_content=Funny%20Text&utm_campaign=400kpromo')
})

test('Remove pattern & return empty string', () => {
  let str = '?utm_source=the_source&utm_medium=camp%20med&utm_term=Bought%20keyword&utm_content=Funny%20Text&utm_campaign=400kpromo'
  let out = cleanParam(/utm/, str)
  console.log('out', out)
  assert.is(out, '')
})

test('Remove pattern leave foo', () => {
  let str = '?utm_source=the_source&foo=lol&utm_medium=camp%20med&utm_term=Bought%20keyword&utm_content=Funny%20Text&utm_campaign=400kpromo'
  let out = cleanParam(/utm/, str)
  console.log('out', out)
  assert.is(out, '?foo=lol')
})

test('Remove pattern leave non matches', () => {
  let str = '?utm_source=the_source&foo=lol&utm_medium=camp%20med&utm_term=Bought%20keyword&utm_content=Funny%20Text&utm_campaign=400kpromo'
  let out = cleanParam(/utm_c/, str)
  console.log('out', out)
  assert.is(out, '?utm_source=the_source&foo=lol&utm_medium=camp%20med&utm_term=Bought%20keyword')
})

test.run()
