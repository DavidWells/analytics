
import q from 'querystring'
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { encode, decode } from '../src/utils/qss'

const { stringify } = q
const parse = (str) => Object.assign({}, q.parse(str))

test.after(() => console.log('tests done'))

test('qss', t => {
	assert.is(typeof encode, 'function', '~> has "encode" function')
	assert.is(typeof decode, 'function', '~> has "decode" function')
})

test('(encode) simple', t => {
	let obj = { foo:123 }
	let out = encode(obj)
	assert.is(out, 'foo=123', 'returns expected value')
	assert.is(out, stringify(obj), 'matches native value')
	assert.is(typeof out, 'string', 'returns a string')
})

test('(encode) simple - multiple', t => {
	let obj = { foo:123, bar:456 }
	let out = encode(obj)
	assert.is(out, 'foo=123&bar=456', 'returns expected value')
	assert.is(out, stringify(obj), 'matches native value')
})

test('(encode) boolean', t => {
	let obj = { foo:true, bar:false }
	let out = encode(obj)
	assert.is(out, 'foo=true&bar=false', 'returns expected value')
	assert.is(out, stringify(obj), 'matches native value')
})

test('(encode) array', t => {
	let obj = { foo:[1,2,3] }
	let out = encode(obj)
	assert.is(out, 'foo=1&foo=2&foo=3', 'returns expected value')
	assert.is(out, stringify(obj), 'matches native value')
})

test('(encode) array - multiple', t => {
	let obj = { foo:[1,2,3], bar:[4,5,6] }
	let out = encode(obj)
	assert.is(out, 'foo=1&foo=2&foo=3&bar=4&bar=5&bar=6', 'returns expected value')
	assert.is(out, stringify(obj), 'matches native value')
})

test('(encode) array - nested', t => {
	let obj = { foo:[ 1,[2],3] }
	let val = stringify(obj)
	let out = encode(obj)
	assert.is(out, 'foo=1&foo=2&foo=3', 'returns expected value')
	assert.is(val, 'foo=1&foo=&foo=3', '>> assert native value, for reference')
	assert.is.not(out, val, 'does NOT match native value')
})

test('(decode) simple', t => {
	let str = 'foo=foo&bar=bar1&bar=bar2'
	let out = decode(str)
	assert.is(typeof out, 'object', 'returns an object')
	assert.equal(out, { foo:'foo', bar:['bar1', 'bar2'] }, '~> is expected value')
	assert.equal(out, Object.assign({}, parse(str)), 'matches native value')
})

test('(decode) numbers', t => {
	let str = 'foo=1&bar=1&bar=2&baz=0'
	let out = decode(str)
	let val = parse(str)
	assert.is(typeof out, 'object', 'returns an object')
	assert.equal(out, { foo:1, bar:[1, 2], baz:0 }, '~> is expected value')
	assert.equal(val, { foo:'1', bar:['1', '2'], baz: '0' }, '>> assert native value, for reference')
	assert.is.not(out, val, 'does NOT match native value')
})

test('(decode) floats', t => {
	let str = 'foo=1&bar=1.3&bar=2.01&bar=2.0&baz=19.111'
	let out = decode(str)
	let val = parse(str)
	assert.is(typeof out, 'object', 'returns an object')
	assert.equal(out, { foo:1, bar:[1.3, 2.01, 2.0], baz: 19.111 }, '~> is expected value')
	assert.equal(val, { foo:'1', bar:['1.3', '2.01', '2.0'], baz:'19.111' }, '>> assert native value, for reference')
	assert.is.not(out, val, 'does NOT match native value')
})

test('(decode) booleans', t => {
	let str = 'foo=true&bar=false&bar=true'
	let out = decode(str)
	let val = parse(str)
	assert.is(typeof out, 'object', 'returns an object')
	assert.equal(out, { foo:true, bar:[false, true] }, '~> is expected value')
	assert.equal(val, { foo:'true', bar:['false', 'true'] }, '>> assert native value, for reference')
	assert.is.not(out, val, 'does NOT match native value')
})

test('Handles null and booleans', t => {
  const orig = { hi: 'there', lol: null, chill: 'null', x: 'false', y: 'true', z: true, a: false }
  const x = encode(orig)
	assert.equal(x, 'hi=there&lol=_null&chill=null&x=_false&y=_true&z=true&a=false', '~> is expected value')
  const d = decode(x)
	assert.equal(d, orig, 'Converts back ok')
})

test('(decode) empty', t => {
	let str1 = 'foo=&bar='
	let out1 = decode(str1)
	let val1 = parse(str1)
	assert.is(typeof out1, 'object', 'returns an object')
	assert.equal(out1, { foo:'', bar:'' }, '~> is expected value')
	assert.equal(out1, parse(str1), 'matches native value')

	let str2 = 'foo&bar'
	let out2 = decode(str2)
	let val2 = parse(str2)
	assert.is(typeof out2, 'object', 'returns an object')
	assert.equal(out2, { foo:'', bar:'' }, '~> is expected value')
	assert.equal(out2, parse(str2), 'matches native value')
})

test.run()
