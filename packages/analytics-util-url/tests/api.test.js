
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { parseUrl, getHost, getDomain, getSubDomain, trimTld } from '../src'

// test.before.each(ENV.reset);
test.after(() => console.log('tests done'))

test('API is exposed', async (context) => {
	assert.ok(true)
  assert.is(typeof trimTld, 'function')
  assert.is(typeof parseUrl, 'function')
  assert.is(typeof getHost, 'function')
})

test('parseUrl', async (context) => {
  assert.equal(parseUrl('https://www.cool.com'), {
    protocol: 'https',
    hostname: 'www.cool.com',
    port: '',
    path: '',
    query: '',
    hash: ''
  })

  assert.equal(parseUrl('https://www.cool.com/my-path'), {
    protocol: 'https',
    hostname: 'www.cool.com',
    port: '',
    path: '/my-path',
    query: '',
    hash: ''
  })

  assert.equal(parseUrl('https://www.cool.com/my-path/here'), {
    protocol: 'https',
    hostname: 'www.cool.com',
    port: '',
    path: '/my-path/here',
    query: '',
    hash: ''
  })

  assert.equal(parseUrl('https://www.cool.com/my-path/here?hello=true'), {
    protocol: 'https',
    hostname: 'www.cool.com',
    port: '',
    path: '/my-path/here',
    query: 'hello=true',
    hash: ''
  })

  assert.equal(parseUrl('https://www.cool.com/my-path/here?hello=true#my-hash=cool'), {
    protocol: 'https',
    hostname: 'www.cool.com',
    port: '',
    path: '/my-path/here',
    query: 'hello=true',
    hash: 'my-hash=cool'
  })

  assert.equal(parseUrl('https://whatever.funky.cool.com'), {
    protocol: 'https',
    hostname: 'whatever.funky.cool.com',
    port: '',
    path: '',
    query: '',
    hash: ''
  })
})

test('getHost', async (context) => {
  assert.equal(getHost('https://www.cool.com'), 'www.cool.com')
  assert.equal(getHost('https://cool.com'), 'cool.com')
  assert.equal(getHost('https://nice.wow.awesome.cool.com'), 'nice.wow.awesome.cool.com')
  assert.equal(getHost('http://nice.com'), 'nice.com')
})

test('getDomain', async (context) => {
  assert.equal(getDomain('https://www.cool.com'), 'cool.com')
  assert.equal(getDomain('https://cool.com'), 'cool.com')
  assert.equal(getDomain('https://nice.wow.awesome.cool.com'), 'cool.com')
  assert.equal(getDomain('http://nice.com'), 'nice.com')
})

test('getSubDomain', async (context) => {
  assert.equal(getSubDomain('http://nice.com'), '')
  assert.equal(getSubDomain('https://wow.cool.com'), 'wow')
  assert.equal(getSubDomain('https://wow.x.cool.com'), 'wow.x')
  assert.equal(getSubDomain('https://nice.wow.awesome.cool.com'), 'nice.wow.awesome')
  assert.equal(getSubDomain('https://nice.wow.awesome.cool.loloololololo.com'), 'nice.wow.awesome.cool')
})


test('trimTld', async (context) => {
  assert.equal(trimTld('nice.com'), 'nice')
})

test.run()
