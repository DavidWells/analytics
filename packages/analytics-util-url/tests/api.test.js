
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { 
  parseUrl, 
  getHost, 
  getDomain,
  getUrl,
  getSubDomain,
  getSearch,
  getSearchValue,
  getHash,
  getHashValue,
  isLocalHost, 
  isUrlLike,
  trimTld 
} from '../src'

// test.before.each(ENV.reset);
test.after(() => console.log('tests done'))

test('API is exposed', async () => {
	assert.ok(true)
  assert.is(typeof trimTld, 'function')
  assert.is(typeof parseUrl, 'function')
  assert.is(typeof getHost, 'function')
})

test('parseUrl', async () => {
  assert.equal(parseUrl('https://www.cool.com'), {
    protocol: 'https',
    hostname: 'www.cool.com',
    port: '',
    pathname: '',
    search: '',
    hash: '',
    href: 'https://www.cool.com'
  })

  assert.equal(parseUrl('https://www.cool.com/my-path'), {
    protocol: 'https',
    hostname: 'www.cool.com',
    port: '',
    pathname: '/my-path',
    search: '',
    hash: '',
    href: 'https://www.cool.com/my-path'
  })

  assert.equal(parseUrl('https://www.cool.com/my-path/here'), {
    protocol: 'https',
    hostname: 'www.cool.com',
    port: '',
    pathname: '/my-path/here',
    search: '',
    hash: '',
    href: 'https://www.cool.com/my-path/here'
  })

  assert.equal(parseUrl('https://www.cool.com/my-path/here?hello=true'), {
    protocol: 'https',
    hostname: 'www.cool.com',
    port: '',
    pathname: '/my-path/here',
    search: 'hello=true',
    hash: '',
    href: 'https://www.cool.com/my-path/here?hello=true'
  })

  assert.equal(parseUrl('https://www.cool.com/my-path/here?hello=true#my-hash=cool'), {
    protocol: 'https',
    hostname: 'www.cool.com',
    port: '',
    pathname: '/my-path/here',
    search: 'hello=true',
    hash: 'my-hash=cool',
    href: 'https://www.cool.com/my-path/here?hello=true#my-hash=cool'
  })

  assert.equal(parseUrl('https://whatever.funky.cool.com'), {
    protocol: 'https',
    hostname: 'whatever.funky.cool.com',
    port: '',
    pathname: '',
    search: '',
    hash: '',
    href: 'https://whatever.funky.cool.com'
  })
})

// test('parseUrl with default value', async () => {
//   assert.equal(parseUrl('', 'NA'), {
//     protocol: 'NA',
//     hostname: 'NA',
//     port: 'NA',
//     pathname: 'NA',
//     search: 'NA',
//     hash: 'NA',
//     href: 'NA'
//   })
// })

test('getUrl', async () => {
  assert.equal(getUrl('http://localhost:8081'), 'http://localhost:8081')
  assert.equal(getUrl('http://localhost:8081/'), 'http://localhost:8081')
  assert.equal(getUrl('http://localhost:8081/?cool=true#hash=true'), 'http://localhost:8081')
  assert.equal(getUrl('http://localhost:8081/path-to-my'), 'http://localhost:8081/path-to-my')
  assert.equal(getUrl('http://localhost:8081/path-to-my?cool=true#hash=true'), 'http://localhost:8081/path-to-my')
  assert.equal(getUrl('https://cool.com'), 'https://cool.com')
  assert.equal(getUrl('https://cool.com/'), 'https://cool.com')
  assert.equal(getUrl('https://nice.wow.awesome.cool.com'), 'https://nice.wow.awesome.cool.com')
  assert.equal(getUrl('https://nice.wow.awesome.cool.com/'), 'https://nice.wow.awesome.cool.com')
  assert.equal(getUrl('http://nice.com/wow/?cool=true'), 'http://nice.com/wow')
  assert.equal(getUrl('http://nice.com/wow/?cool=true#hash=true'), 'http://nice.com/wow')
})

test('getHost', async () => {
  assert.equal(getHost('https://www.cool.com'), 'www.cool.com')
  assert.equal(getHost('https://cool.com'), 'cool.com')
  assert.equal(getHost('https://nice.wow.awesome.cool.com'), 'nice.wow.awesome.cool.com')
  assert.equal(getHost('http://nice.com'), 'nice.com')
})

test('getDomain', async () => {
  assert.equal(getDomain('https://www.cool.com'), 'cool.com')
  assert.equal(getDomain('https://cool.com'), 'cool.com')
  assert.equal(getDomain('https://nice.wow.awesome.cool.com'), 'cool.com')
  assert.equal(getDomain('http://nice.com'), 'nice.com')
})

test('getSubDomain', async () => {
  assert.equal(getSubDomain('http://nice.com'), '')
  assert.equal(getSubDomain('https://wow.cool.com'), 'wow')
  assert.equal(getSubDomain('https://wow.x.cool.com'), 'wow.x')
  assert.equal(getSubDomain('https://nice.wow.awesome.cool.com'), 'nice.wow.awesome')
  assert.equal(getSubDomain('https://nice.wow.awesome.cool.loloololololo.com'), 'nice.wow.awesome.cool')
})

/* Search */
test('getSearch', async () => {
  const url = 'http://glocal.dev/?utm_source=the_source&utm_medium=camp%20med&utm_term=Bought%20keyword&utm_content=Funny%20Text&utm_campaign=400kpromo'
  assert.equal(getSearch(url), {
    "utm_source": "the_source",
    "utm_medium": "camp med",
    "utm_term": "Bought keyword",
    "utm_content": "Funny Text",
    "utm_campaign": "400kpromo"
  })
  // Get as string
  assert.equal(getSearch(url, true), "utm_source=the_source&utm_medium=camp%20med&utm_term=Bought%20keyword&utm_content=Funny%20Text&utm_campaign=400kpromo")
  // Get a key
  assert.equal(getSearch(url, 'utm_medium'), "camp med")
})

test('getSearchValue', async () => {
  const url = 'http://glocal.dev/?utm_source=the_source&utm_medium=camp%20med&utm_term=Bought%20keyword&utm_content=Funny%20Text&utm_campaign=400kpromo'
  assert.equal(getSearchValue('utm_medium', url), "camp med")
})

/* Hash */
test('getHash', async () => {
  const url = 'http://glocal.dev/#utm_source=the_source&utm_medium=camp%20med&utm_term=Bought%20keyword&utm_content=Funny%20Text&utm_campaign=400kpromo'
  assert.equal(getHash(url), {
    "utm_source": "the_source",
    "utm_medium": "camp med",
    "utm_term": "Bought keyword",
    "utm_content": "Funny Text",
    "utm_campaign": "400kpromo"
  })
  // Get as string
  assert.equal(getHash(url, true), "utm_source=the_source&utm_medium=camp%20med&utm_term=Bought%20keyword&utm_content=Funny%20Text&utm_campaign=400kpromo")
  // Get a key
  assert.equal(getHash(url, 'utm_medium'), "camp med")
})

test('getHashValue', async () => {
  const url = 'http://glocal.dev/#utm_source=the_source&utm_medium=camp%20med&utm_term=Bought%20keyword&utm_content=Funny%20Text&utm_campaign=400kpromo'
  assert.equal(getHashValue('utm_medium', url), "camp med")
})

test('isLocalhost', async () => {
  assert.is(isLocalHost('http://localhost:8081/'), true)
  assert.is(isLocalHost('127.0.0.1'), true)
  assert.is(isLocalHost('http://nice.com'), false)
})

test('isUrlLike', async () => {
  const testCases = [
    ['nice.com', true],
    ['www.nice.com', true],
    ['http://nice.com', true],
    ['http://www.nice.com', true],
    ['https://www.nice.com', true],
    ['https://www.nice.com/path/xyz', true],
    ['https://www.nice.com/path/xyz#utm_source=the_source&utm_medium=camp', true],
    ['https://www.nice.com/path/xyz?utm_source=the_source&utm_medium=camp', true],
    ['https://www.nice.com/path/xyz?utm_source=the_source&utm_medium=camp#foo=bar', true],
    ['http://localhost:8081/', true],
    ['127.0.0.1', true],
    ['foo', false],
    [false, false],
    [true, false],
    [{}, false],
    [[], false],
    [null, false],
    ['#utm_source=the_source&utm_medium=camp%20med&utm_term=Bought%20keyword', false],
    ['?utm_source=the_source&utm_medium=camp%20med&utm_term=Bought%20keyword', false],
  ]
  testCases.forEach(([ val, result ]) => {
    assert.is(isUrlLike(val), result, val)
  })
})

test('trimTld', async () => {
  assert.equal(trimTld('nice.com'), 'nice')
})

test.run()
