import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { inspect } from 'util'
import { redactObject, restoreObject, cleanObject } from '../src/index.js'

function log(...msgs) {
  msgs.forEach((msg) => {
    console.log(inspect(msg, {showHidden: false, depth: null}))
  })
}

let testObj = {
  $lol: 'cool',
  hi: 'awesome',
  $bob: {
    $nice: 'cool',
    okay: 'hi',
    $foo: 'bar',
    $empty: ''
  },
  $bill: false,
  cool: ['what', 'owowow'],
  $test: ['what', 'owowow'],
  $what: [{ $lol: 'cool' }, { okay: 'nooooo' }, true],
  $encode: {
    $nice: {
      $lol: 'cool'
    },
  },
}

test('Encodes all prefixed values', () => {
  log('orignal', testObj)
  const encoded = redactObject(testObj)
  log('encoded', encoded)
  const decoded = restoreObject(encoded)
  log('decoded', decoded)
  console.log('clean', cleanObject(decoded))

  assert.equal(encoded, {
    _: [
      'JGxvbA==',
      'JGJvYg==',
      'JGJpbGw=',
      'JHRlc3Q=',
      'JHdoYXQ=',
      'JGVuY29kZQ=='
    ],
    'JGxvbA==': 'Y29vbA==',
    hi: 'awesome',
    'JGJvYg==': {
      _: [ 'JG5pY2U=', 'JGZvbw==', 'JGVtcHR5' ],
      'JG5pY2U=': 'Y29vbA==',
      okay: 'hi',
      'JGZvbw==': 'YmFy',
      JGVtcHR5: ''
    },
    'JGJpbGw=': false,
    cool: [ 'what', 'owowow' ],
    'JHRlc3Q=': [ 'd2hhdA==', 'b3dvd293' ],
    'JHdoYXQ=': [
      { _: [ 'JGxvbA==' ], 'JGxvbA==': 'Y29vbA==' },
      { okay: 'nooooo' },
      true
    ],
    'JGVuY29kZQ==': {
      _: [ 'JG5pY2U=' ],
      'JG5pY2U=': { _: [ 'JGxvbA==' ], 'JGxvbA==': 'Y29vbA==' }
    }
  })
})

test('Decodes all prefixed values', () => {
  const encoded = redactObject(testObj)
  const decoded = restoreObject(encoded)
  log('decoded', decoded)

  const cleanedObj = cleanObject(decoded)
  // log('cleanedObj', cleanedObj)
  assert.equal(cleanedObj, {
    lol: 'cool',
    hi: 'awesome',
    bob: {
      foo: 'bar',
      nice: 'cool',
      okay: 'hi',
      empty: '',
    },
    bill: false,
    cool: [ 'what', 'owowow' ],
    test: [ 'what', 'owowow' ],
    what: [ { lol: 'cool' }, { okay: 'nooooo' }, true ],
    encode: { nice: { lol: 'cool' } }
  })
})

test('re-encodes all prefixed values', () => {
  const original = {
    hi: 'awesome',
    cool: ['what', 'owowow'],
    encode: {
      $nice: {
        $lol: 'cool'
      },
    },
  }
  log('original', original)
  const encoded = redactObject(original)
  log('encoded', encoded)
  assert.equal(encoded, {
    hi: 'awesome',
    cool: [ 'what', 'owowow' ],
    encode: {
      _: [ 'JG5pY2U=' ],
      'JG5pY2U=': { _: [ 'JGxvbA==' ], 'JGxvbA==': 'Y29vbA==' }
    }
  })
  const decoded = restoreObject(encoded)
  log('decoded', decoded)
  assert.equal(decoded, original)
  const reencoded = redactObject(decoded)
  log('reencoded', reencoded)
  const cleanedObj = cleanObject(decoded)
  log('cleanedObj', cleanedObj)
  const restoreWithClean = restoreObject(encoded, true)
  log('restoreWithClean', restoreWithClean)
})


test('It throws on duplicate "key" and "$key" values', () => {
  const testObj = {
    $lol: 'cool',
    bob: 'xys',
    $bob: {
      $nice: 'cool',
      okay: 'hi'
    },
  }
  
  try {
    const encoded = redactObject(testObj)
    console.log('encoded', encoded)
    assert.unreachable('Expected error to be thrown')
  } catch (error) {
    assert.is(error.message, 'Redact error: Dupe keys \'bob\' & \'$bob\'')
  }
})

test('xyz', () => {
  const original = {
    hi: 'awesome',
    $email: 'foo@bar.com',
    cool: ['1', '2'],
    encode: {
      visible: 'value',
      $nice: {
        $lol: 'this will be encoded'
      },
    },
  }
  log('original', original)
  const encoded = redactObject(original)
  log('encoded', encoded)
  const decoded = restoreObject(encoded) 
  log('decoded', decoded)
  const decodedClean = restoreObject(encoded, true)  
  log('decodedClean', decodedClean)
  assert.equal(original, decoded)
})

test.run()