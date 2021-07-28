import { test }  from 'uvu'
import assert from 'uvu/assert'
import parse from '../src/utils/parse'

test('Parse is func', () => {
	assert.type(parse, 'function')
})

test('Empty is undef', () => {
	assert.is(parse(""), undefined)
	assert.is(parse('""'), undefined)
	assert.is(parse(null), undefined)
	assert.is(parse(undefined), undefined)
})

test('Strings', () => {
	assert.is(parse("x"), 'x')
	assert.is(parse('"x"'), 'x')
	assert.is(parse('"x"'), 'x')
	assert.is(parse("'x'"), "'x'")
})

test('Numbers', () => {
	assert.is(parse("1"), 1)
	assert.is(parse(1), 1)
	assert.is(parse("1.0"), 1)
	assert.is(parse("1.02"), 1.02)
	assert.is(parse('"1"'), "1")
})

test('Boolean', () => {
	assert.is(parse("true"), true)
	assert.is(parse(true), true)
	assert.is(parse("false"), false)
	assert.is(parse('"false"'), false)
	assert.is(parse(false), false)
	

	assert.is(parse("'true'"), "'true'")
	assert.is(parse("'false'"), "'false'")
})


test('Object', () => {
	const obj = { object: 'value' }
	assert.is(parse(obj), obj)

	const obj2 = parse('{ "obj": "xyz" }')
	assert.is(obj2.obj, "xyz")

	const obj3 = parse('"{ "xyz": 123 }"')
	assert.is(obj3, '"{ "xyz": 123 }"')
})

test.run()