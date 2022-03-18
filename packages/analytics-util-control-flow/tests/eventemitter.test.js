
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { spy } from 'nanospy'
import { eventEmitter, getWildCards } from '../src'

test.after(() => console.log('tests done'))


test('API is exposed', async () => {
  assert.is(typeof eventEmitter, 'function')
})

test('Basic', async () => {
  const events = eventEmitter()
  const fn = spy()
  events.on('trigger', fn)
  events.emit('trigger')
  assert.equal(fn.callCount, 1, 'Ran emitter')
})

test('getWildCards', async () => {

  assertArray(getWildCards('chill'), ['*', 'chill', 'chill*'], `getWildCards('chill')`)

  assertArray(getWildCards('chill*'), ['*', 'chill', 'chill*'], `getWildCards('chill*')`)

  assertArray(getWildCards('chill.*'), [ '*', 'chill.*' ], `getWildCards('chill.*')`)

  assertArray(getWildCards('chill.cool'), ['*', 'chill.*', 'chill*', 'chill.cool', 'chill.cool*'], `getWildCards('chill.cool')`)

  assertArray(
    getWildCards('chill.cool.awesome'),
    [
      '*',
      'chill*',
      'chill.*',
      'chill.cool*',
      'chill.cool.*',
      'chill.cool.awesome',
      'chill.cool.awesome*'
    ], 
    `getWildCards('chill.cool.awesome')`
  )

  assertArray(
    getWildCards('chill.cool.awesome*'),
    [
      '*',
      'chill.cool.awesome*',
      'chill.cool.awesome',
      'chill.*',
      'chill*',
      'chill.cool.*',
      'chill.cool*'
    ], 
    `getWildCards('chill.cool.awesome*')`
  )

  assertArray(
    getWildCards('chill.cool.awesome.*'),
    [ 
      '*', 
      'chill.*',
      'chill.cool.*', 
      'chill.cool.awesome.*' 
    ], 
    `getWildCards('chill.cool.awesome.*')`
  )
})

test('Return types', async () => {
  const events = eventEmitter()
  assert.is(typeof events, 'object')
  const unsubscribe = events.on('event', () => {})
  assert.is(typeof unsubscribe, 'function')
  const resub = unsubscribe()
  assert.is(typeof resub, 'function')
})

test('Callbacks fired', async () => {
  const events = eventEmitter()
  const spied = spy()
  events.on('bill', (d) => spied())
  // Fire events
  events.emit('bill')
  assert.equal(spied.callCount, 1, 'Fired callback')

  // Fire events
  events.emit('bill')
  events.emit('bill')
  events.emit('bill')
  assert.equal(spied.callCount, 4, 'Fired callback 4')
})

test('Event order', async () => {
  let data = []
  const events = eventEmitter()

  events.on('bill', (d) => data.push('bill'))
  events.on('john', (d) => data.push('john1'))
  events.on('john', (d) => data.push('john2'))
  events.on('john.doe', (d) => data.push('john.doe'))
  events.on('john.doe.mail', (d) => data.push('john.doe.mail'))

  // Fire events
  events.emit('bill')
  assert.equal(data, ['bill'], 'Order')

  events.emit('john')
  assert.equal(data, ['bill', 'john1', 'john2'], 'Order2')

  events.emit('john.doe*')
  assert.equal(data, ['bill', 'john1', 'john2', 'john.doe', 'john.doe.mail'], 'Order2')
})

test('emit payload', async () => {
  const events = eventEmitter()
  let payload
  events.on('one', (d) => {
    payload = d
  })
  events.emit('one')
  assert.equal(payload, { event: 'one', src: 'one', data: undefined }, 'payload exists')

  // ───────────────────────
  let payloadWithData
  events.on('two', (d) => {
    payloadWithData = d
  })
  const data = { myCustomData: 'here' }
  events.emit('two', data)
  assert.equal(payloadWithData, { event: 'two', src: 'two', data: data }, 'payload with data exists')
})

test('.on', async () => {
  const events = eventEmitter()
  let data = []

  function one(d) {
    data.push('one')
  }
  function two(d) {
    data.push('two')
  }
  function three(d) {
    data.push('three')
  }
  function four(d) {
    data.push('four')
  }

  events.on('one', one)
  events.on('one', two)
  events.on('one', three)
  events.on('one', four)
  events.on('one.a', (d) => data.push('one.a'))
  events.on('one.b', (d) => data.push('one.b'))
  events.on('one.c', (d) => data.push('one.c'))
  events.on('one.c.xyz', (d) => data.push('one.c.xyz'))

  /* Emit to exact listener */
  events.emit('one')
  assert.equal(data, ['one', 'two', 'three', 'four'], '.off single function')

  /* Emit to exact dot star listener */
  data = [] // reset
  events.emit('one.*')
  assert.equal(data, ['one.a', 'one.b', 'one.c', 'one.c.xyz' ], 'Emit to star')

  /* Emit to exact star listener */
  data = [] // reset
  events.emit('one*')
  assert.equal(data, ['one', 'two', 'three', 'four', 'one.a', 'one.b', 'one.c', 'one.c.xyz' ], 'Emit to star')
})

test('.on *', async () => {
  const events = eventEmitter()
  const spied = spy()

  events.on('*', spied)

  events.emit('one')
  events.emit('two')
  events.emit('three')
  assert.equal(spied.callCount, 3, 'all listener')
})

test('.on wildcard', async () => {
  const events = eventEmitter()
  const spied = spy()

  events.on('one', spied)

  events.emit('one')
  assert.equal(spied.callCount, 1, 'spied.callCount 1')

  events.on('one', spied) // second one
  events.on('one.a', spied)
  events.on('one.b', spied)
  events.on('one.c', spied)
  events.on('one.c.xyz', spied)

  events.emit('one')
  assert.equal(spied.callCount, 3, 'spied.callCount 3')

  events.emit('one.a')
  assert.equal(spied.callCount, 4, `spied events.emit('one.a')`)

  events.emit('one*')
  assert.equal(spied.callCount, 10, `spied events.emit('one*')`)

  events.emit('one.*')
  assert.equal(spied.callCount, 14, `spied events.emit('one.*')`)

  events.emit('one.c.*')
  assert.equal(spied.callCount, 15, `spied events.emit('one.c.*')`)

  events.emit('one*')
  assert.equal(spied.callCount, 21, `spied events.emit('one*')`)
})

test(`events.on('one*')`, async () => {
  const events = eventEmitter()
  const spied = spy()

  events.on('one', spied)
  events.emit('one')
  assert.equal(spied.callCount, 1, '')
  events.off('one')

  const two = spy()
  events.on('one*', two)
  events.emit('one')
  events.emit('one.a')
  events.emit('one.a.lol')
  events.emit('two') // no match
  assert.equal(two.callCount, 3, '')
})

test(`events.on('one.*')`, async () => {
  const events = eventEmitter()
  const spied = spy()

  events.on('one.*', spied)

  events.emit('one') // no match
  events.emit('two') // no match
  events.emit('one.a')
  events.emit('one.*')
  events.emit('one.a.lol')
  events.emit('one.a.lol.longer')
  assert.equal(spied.callCount, 4, 'spied.callCount, 4')
})

test(`events.on('one.a.*')`, async () => {
  const events = eventEmitter()
  const spied = spy()
  events.on('one.a.*', spied)

  events.emit('one') // no match
  events.emit('two') // no match
  events.emit('one.a') // no match
  events.emit('one.b') // no match
  events.emit('one.a.two')
  events.emit('one.a.lol')
  events.emit('one.a.lol.three')
  events.emit('one.a.lol.four')
  assert.equal(spied.callCount, 4, 'spied.callCount 4')
})

test('.off', async () => {
  const events = eventEmitter()
  let data = []

  function one(d) {
    data.push('one')
  }

  function two(d) {
    data.push('two')
  }

  function three(d) {
    data.push('three')
  }

  function four(d) {
    data.push('four')
  }

  events.on('zero', (d) => data.push('zero'))
  events.on('one', one)
  events.on('one', two)
  events.on('one', three)
  events.on('one', four)
  events.on('one.a', (d) => data.push('one.a'))
  events.on('one.b', (d) => data.push('one.b'))

  events.on('two', (d) => data.push('two'))
  events.on('two.a', (d) => data.push('two.a'))
  events.on('two.b', (d) => data.push('two.b'))

  /* Disable listener */
  events.off('zero')
  events.emit('zero') // Emit to disabled listener
  assert.equal(data, [], `events.off('zero') worked`)

  /* Disable single fn on listener */
  events.off('one', two)
  events.emit('one') // Emit to disabled listener 
  assert.equal(data, ['one', 'three', 'four'], `events.off('one', two) single function worked`)

  /* Disable all listeners on 'one */
  events.off('one')
  events.emit('one') // Emit to disabled listener
  assert.equal(data, ['one', 'three', 'four'], `.off disable all listeners on handler`)

  // ───────────────────────

  /* Verify dot star listeners */
  data = [] // reset
  events.emit('two.*')
  assert.equal(data, [ 'two.a', 'two.b' ], `Verify events.emit('two.*') fires corrects`)

  /* Disable dot star listeners */
  data = [] // reset
  events.off('two.*')
  events.emit('two.*')
  assert.equal(data, [], `disables events.off('two.*') correctly`)

  /* Verify remaining listeners */
  data = [] // reset
  events.emit('two')
  assert.equal(data, ['two'], `Verify listener events.emit('two') works`)

  /* Verify remaining listeners */
  data = [] // reset
  events.emit('two*')
  assert.equal(data, ['two'], `Verify listener events.emit('two*') works`)

  /* Disable remaining listeners */
  data = [] // reset
  events.off('two*')
  events.emit('two*')
  assert.equal(data, [], `Verify events.off('two*') *`)
  // ───────────────────────

})

test('tiny', async () => {
  const events = eventEmitter()
  const data = [] // reset
  events.on('two.a', (d) => data.push('two.a'))
  events.on('two.b', (d) => data.push('two.b'))
  events.emit('two.*')
  assert.equal(data, [ 'two.a', 'two.b' ], `Verify events.emit('two.*') fires corrects`)
})

function assertArray(arr1, arr2, name = '') {
  assert.equal(arr1.sort(), arr2.sort(), true, name)
}

test.run()
