const test = require('ava')
const { inspect } = require('util')
const { redactObject, restoreObject, cleanObject } = require('../src')

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

test('Encodes all prefixed values', t => {
  log('orignal', testObj)
  const encoded = redactObject(testObj)
  log('encoded', encoded)
  const decoded = restoreObject(encoded)
  log('decoded', decoded)
  console.log('clean', cleanObject(decoded))

  t.deepEqual(encoded, {
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

test('Decodes all prefixed values', t => {
  const encoded = redactObject(testObj)
  const decoded = restoreObject(encoded)
  log('decoded', decoded)

  const cleanedObj = cleanObject(decoded)
  // log('cleanedObj', cleanedObj)
  t.deepEqual(cleanedObj, {
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

test('re-encodes all prefixed values', t => {
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
  t.deepEqual(encoded, {
    hi: 'awesome',
    cool: [ 'what', 'owowow' ],
    encode: {
      _: [ 'JG5pY2U=' ],
      'JG5pY2U=': { _: [ 'JGxvbA==' ], 'JGxvbA==': 'Y29vbA==' }
    }
  })
  const decoded = restoreObject(encoded)
  log('decoded', decoded)
  t.deepEqual(decoded, original)
  const reencoded = redactObject(decoded)
  log('reencoded', reencoded)
  const cleanedObj = cleanObject(decoded)
  log('cleanedObj', cleanedObj)
  const restoreWithClean = restoreObject(encoded, true)
  log('restoreWithClean', restoreWithClean)
})


test('It throws on duplicate "key" and "$key" values', t => {
  const testObj = {
    $lol: 'cool',
    bob: 'xys',
    $bob: {
      $nice: 'cool',
      okay: 'hi'
    },
  }
	const error = t.throws(() => {
	  const encoded = redactObject(testObj)
    console.log('encoded', encoded)
	}, {instanceOf: Error});

	t.is(error.message, 'Redact error: Dupe keys \'bob\' & \'$bob\'');
})

test('xyz', t => {
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
  t.deepEqual(original, decoded)
})