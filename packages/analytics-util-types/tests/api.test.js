
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import * as lib from '../src'
const {
  NULL,
  ARRAY,
  OBJECT,
  NUMBER,
  FUNCTION,
  BOOLEAN,
  ERROR,
  ASYNC_FUNCTION,
  GENERATOR_FUNCTION,
  ASYNC_GENERATOR_FUNCTION,
  TYPE_ERROR,
  SYNTAX_ERROR,
  noOp,
  getType,
  ctorName,
  isNumber,
  isNumberLike,
  isArray,
  isObject,
  isFunction,
  isGeneratorFunction,
  isBoolean,
  isError,
  isErrorLike,
  isTypeError,
  isSyntaxError,
  isRegex,
  isTrue,
  isFalse,
  isPrimitive,
  isJson
} = lib

test.after(() => console.log('tests done'))

test('API is exposed', async () => {
  const { noOp, ...rest } = lib
  const methods = Object.keys(rest).filter((x) => !x.match(/^[A-Z]/))
  console.log('API methods', methods)
  assert.is(isFunction(isArray), true)
  assert.is(isFunction(isNumber), true)
  assert.is(isFunction(isNumberLike), true)
  assert.is(isFunction(isArray), true)
})

const booleans = [ true, false ]

const trueLike = [
  1,
  'true', 
  't', 
  'yes', 
  'y', 
  'on', 
  '1'
]

const falseLike = [
  0,
  'false', 
  'f', 
  'no', 
  'n', 
  'off', 
  '0'
]

const numbers = [
  0,
  1,
  1.1,
  1.11111,
  Infinity,
  0xff,
  6.2e5,
  NaN,
]

const numberLike = [
  '1',
  '1.0',
  '0.02',
]

const nonValues = [
  undefined,
  NaN,
  null
]

const arrays =  [ 
  [],
  ['foo'],
  new Array(),
  new Array('Apple', 'Banana'),
]

const objectWithMethods = { 
  fn: () => {}, 
  method() {},
  async otherThing() {},
  xyz: function* () {},
  abc: async function* () {}
}
const functions = [
 noOp,
 () => {},
 function () {},
 objectWithMethods.fn,
 objectWithMethods.method
]

const asyncFuncs = [
  async () => {},
  async function () {},
  objectWithMethods.otherThing,
]

const generatorFuncs = [
  function* () {},
  objectWithMethods.xyz,
]

const asyncGeneratorFuncs = [
  async function* () {},
  objectWithMethods.abc,
]

const error = new Error()
const typeError = new TypeError('type err')
const syntaxError = new SyntaxError('syntax err')

const errors = [
  error,
  typeError,
  syntaxError,
]

const errorLike = [
  ...errors,
  { name: "Error!", message: "This is an error", other: 0}
]

const typeMap = [
  [ null, NULL ],
  [ {}, OBJECT ],
  ...booleans.map((x) => [x, BOOLEAN]),
  ...numbers.map((x) => [x, NUMBER]),
  ...functions.map((x) => [x, FUNCTION]),
  ...arrays.map((x) => [x, ARRAY]),
  ...asyncFuncs.map((x) => [x, ASYNC_FUNCTION]),
  ...generatorFuncs.map((x) => [x, GENERATOR_FUNCTION]),
  ...asyncGeneratorFuncs.map((x) => [x, ASYNC_GENERATOR_FUNCTION]),
  // Errors
  ...[
    [ error, ERROR],
    [ typeError, TYPE_ERROR],
    [ syntaxError, SYNTAX_ERROR],
  ],
]

test('getType', async () => {
  typeMap.forEach(([ value, type ]) => {
    console.log(`──────────────`)
    console.log(`type: ${type}`)
    if (isObject(value)) {
      console.log(`ctorName:`, ctorName(value))
    }
    console.log(value)
    assert.is(getType(value), type, value)
  })
})

test('getType caps', async () => {
  typeMap.forEach(([ value, type ]) => {
    console.log(`──────────────`)
    console.log(`type: ${type}`)
    console.log(`getType upper`, getType(value, false))
    assert.is(getType(value, false), capitalize(type), value)
  })
})

test('isArray', async () => {
  assert.is(typeof isArray, 'function')
  assert.equal(isArray([]), true)
  assert.equal(isArray(['foo']), true)
  assert.equal(isArray(new Array()), true)
  assert.equal(isArray(new Array('Apple', 'Banana')), true)
  assert.equal(isArray(NaN), false)
  function testArgs() {
    assert.equal(isArray(Array.prototype.slice.call(arguments)), true)
  }
  testArgs()
})

test('isNumber', async () => {
  assert.equal(isNumber(0), true)
  assert.equal(isNumber(1), true)
  assert.equal(isNumber(1.1), true)
  assert.equal(isNumber(Infinity), true, 'Infinity')
  assert.equal(isNumber(0xff), true)
  assert.equal(isNumber(6.2e5), true, '6.2e5')
  assert.equal(isNumber(NaN), false, 'NaN')
  assert.equal(isNumber('1'), false, 'string')
  assert.equal(isNumber('1.0'), false, 'string')
  assert.equal(isNumber('0.02'), false, 'string')
  // assert.equal(isNumber(0644), true)
})

test('isNumberLike', async () => {
  assert.equal(isNumberLike('1'), true, 'string')
  assert.equal(isNumberLike('1.0'), true, 'string')
  assert.equal(isNumberLike('0.02'), true, 'string')
  assert.equal(isNumberLike(0), true)
  assert.equal(isNumberLike(1), true)
  assert.equal(isNumberLike(1.1), true)
  assert.equal(isNumberLike(Infinity), true, 'Infinity')
  assert.equal(isNumberLike(0xff), true)
  assert.equal(isNumberLike(6.2e5), true, '6.2e5')
  assert.equal(isNumberLike(NaN), false, 'NaN')
  // assert.equal(isNumber(0644), true)
})

test('isFunction', () => {
  const allFunctionTypes = [
    ...functions,
    ...asyncFuncs,
    ...generatorFuncs,
    ...asyncGeneratorFuncs,
  ]
  assert.equal(isFunction(NaN), false)
  assert.equal(isFunction(() => {}), true)
  assert.equal(isFunction(function () {}), true)
  assert.equal(isFunction(async () => {}), true)
  assert.equal(isFunction(async function () {}), true)
  assert.equal(isFunction(function* () {}), true)
  assert.equal(isFunction(async function* () {}), true)
  const _ = { fn: () => {}, method() {} }
  assert.equal(isFunction(_.fn), true)
  assert.equal(isFunction(_.method), true)

  allFunctionTypes.forEach((value) => {
    assert.equal(isFunction(value),true, value)
  })
})

test('isGeneratorFunction', () => {
  assert.equal(isGeneratorFunction(function* () {}), true)
  assert.equal(isGeneratorFunction(NaN), false)
  assert.equal(isGeneratorFunction(() => {}), false)
  assert.equal(isGeneratorFunction(function () {}), false)
  assert.equal(isGeneratorFunction(async () => {}), false)
  assert.equal(isGeneratorFunction(async function () {}), false)

  generatorFuncs.forEach((value) => {
    assert.equal(isGeneratorFunction(value), true, value)
  })
})

test('isBoolean', () => {
  assert.equal(isBoolean(true), true)
  assert.equal(isBoolean(false), true)
  assert.equal(isBoolean(null), false)
  assert.equal(isBoolean(undefined), false)
  assert.equal(isBoolean('undefined'), false)
  assert.equal(isBoolean(0), false)
  assert.equal(isBoolean(1), false)
  assert.equal(isBoolean(1.1), false)
})

test('isObject', () => {
  function MyClass() {}
  MyClass.prototype.constructor = MyClass
  assert.equal(isObject({}), true)
  assert.equal(isObject(new Object()), true)
  assert.equal(isObject(new Array()), false)
  assert.equal(isObject([]), false)
  assert.equal(isObject(NaN), false)
  assert.equal(isObject(new MyClass()), false)
  assert.equal(isObject(new Date()), false)
})

test('isError', () => {
  errors.forEach((value) => {
    assert.is(isError(value), true, JSON.stringify(value))
  })
})

test('isErrorLike', () => {
  errorLike.forEach((value) => {
    assert.is(isErrorLike(value), true, value)
  })
})

test('isTypeError', () => {
  assert.is(isTypeError(typeError), true, 'isTypeError(typeError)')
  assert.is(isTypeError(syntaxError), false, 'isTypeError(syntaxError)')
  assert.is(isTypeError(error), false, 'isTypeError(error)')
})

test('isSyntaxError', () => {
  assert.is(isSyntaxError(syntaxError), true, 'isTypeError(syntaxError)')
  assert.is(isSyntaxError(typeError), false, 'isTypeError(typeError)')
  assert.is(isSyntaxError(error), false, 'isTypeError(error)')
})

test('isRegex', () => {
  assert.equal(isRegex(/xyz/), true)
  assert.equal(isRegex(/xyz/gmi), true)
  assert.equal(isRegex('true'), false)
  assert.equal(isRegex(1), false)
  assert.equal(isRegex(0), false)
  assert.equal(isRegex(false), false)
  assert.equal(isRegex(null), false)
  assert.equal(isRegex(undefined), false)
})

test('isTrue', () => {
  assert.equal(isTrue(true), true)
  assert.equal(isTrue('true'), false)
  assert.equal(isTrue(1), false)
  assert.equal(isTrue(0), false)
  assert.equal(isTrue(false), false)
  assert.equal(isTrue(null), false)
  assert.equal(isTrue(undefined), false)
})

test('isFalse', () => {
  assert.equal(isFalse(false), true)
  assert.equal(isFalse('false'), false)
  assert.equal(isFalse(1), false)
  assert.equal(isFalse(0), false)
  assert.equal(isFalse(true), false)
  assert.equal(isFalse(null), false)
  assert.equal(isFalse(undefined), false)
})

test('Primitive tests', () => {
  // true
  assert.equal(isPrimitive(0), true)
  assert.equal(isPrimitive(''), true)
  assert.equal(isPrimitive('str'), true)
  assert.equal(isPrimitive(Symbol()), true)
  assert.equal(isPrimitive(true), true)
  assert.equal(isPrimitive(false), true)
  assert.equal(isPrimitive(null), true)
  assert.equal(isPrimitive(undefined), true)
  // false
  // assert.equal(isPrimitive(NaN), false)
  assert.equal(isPrimitive([]), false)
  assert.equal(isPrimitive(new Array()), false)
  assert.equal(isPrimitive({}), false)
  assert.equal(isPrimitive(new Object()), false)
  assert.equal(isPrimitive(new Date()), false)
  assert.equal(isPrimitive(() => {}), false)
})

test('isJson', () => {
  assert.equal(isJson('{"a":5}'), true)
  assert.equal(isJson('[]'), true)
  assert.equal(isJson('{a":5}'), false)
  assert.equal(isJson(0), false)
  assert.equal(isJson(true), false)
  assert.equal(isJson(null), false)
  assert.equal(isJson(undefined), false)
})

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

test.run()
