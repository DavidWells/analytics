import test from 'ava'
import cleanParam from './paramsClean'

test('Clean single param value', t => {
  let str = '?foo=zoo&bar[]=bar1&bar[]=bar2'
  let out = cleanParam('foo', str)
  t.is(out, '?bar[]=bar1&bar[]=bar2')
})

test('Remove all instance of string match', t => {
  let str = '?foo=zoo&bar[]=bar1&bar[]=bar2'
  let out = cleanParam('bar[]', str)
  console.log('out', out)
  t.is(out, '?foo=zoo')
})

test('Remove utm_medium', t => {
  let str = '?utm_source=the_source&utm_medium=camp%20med&utm_term=Bought%20keyword&utm_content=Funny%20Text&utm_campaign=400kpromo'
  let out = cleanParam('utm_medium', str)
  console.log('out', out)
  t.is(out, '?utm_source=the_source&utm_term=Bought%20keyword&utm_content=Funny%20Text&utm_campaign=400kpromo')
})

test('Remove pattern & return empty string', t => {
  let str = '?utm_source=the_source&utm_medium=camp%20med&utm_term=Bought%20keyword&utm_content=Funny%20Text&utm_campaign=400kpromo'
  let out = cleanParam(/utm/, str)
  console.log('out', out)
  t.is(out, '')
})

test('Remove pattern leave foo', t => {
  let str = '?utm_source=the_source&foo=lol&utm_medium=camp%20med&utm_term=Bought%20keyword&utm_content=Funny%20Text&utm_campaign=400kpromo'
  let out = cleanParam(/utm/, str)
  console.log('out', out)
  t.is(out, '?foo=lol')
})

test('Remove pattern leave non matches', t => {
  let str = '?utm_source=the_source&foo=lol&utm_medium=camp%20med&utm_term=Bought%20keyword&utm_content=Funny%20Text&utm_campaign=400kpromo'
  let out = cleanParam(/utm_c/, str)
  console.log('out', out)
  t.is(out, '?utm_source=the_source&foo=lol&utm_medium=camp%20med&utm_term=Bought%20keyword')
})
