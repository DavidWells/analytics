import './_setup.js'
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import sinon from 'sinon'
import delay from './_utils/delay.js'
import Analytics from '../src/index.js'

let sandbox

test.before(() => {
  sandbox = sinon.createSandbox()
})

test('Plugin with [x]Start should enrich [x]Start payloads', async () => {
  let secondPayload
  let finalPayload
  Analytics({
    app: 'appname',
    version: 100,
    plugins: [
      {
        name: 'plugin-one',
        initializeStart: ({ payload }) => {
          return {
            ...payload,
            ...{
              foo: 'baz'
            }
          }
        }
      },
      {
        name: 'plugin-two',
        initializeStart: ({ payload }) => {
          secondPayload = payload
          return {
            ...payload,
            ...{
              fizz: 'pop'
            }
          }
        }
      },
      {
        name: 'plugin-three',
        initializeStart: ({ payload }) => {
          finalPayload = payload
        }
      },
    ]
  })

  await delay(100)

  assert.ok(secondPayload.meta)

  delete secondPayload.meta 
  assert.equal(secondPayload, {
    type: 'initializeStart',
    plugins: [ 'plugin-one', 'plugin-two', 'plugin-three' ],
    disabled: [],
    foo: 'baz'
  })

  assert.ok(finalPayload.meta)

  delete finalPayload.meta 
  assert.equal(finalPayload, {
    type: 'initializeStart',
    plugins: [ 'plugin-one', 'plugin-two', 'plugin-three' ],
    foo: 'baz',
    fizz: 'pop',
    disabled: [],
  })
})

test('Plugin (not xStart) returning values should NOT enrich other payloads', async () => {
  let firstPayload
  let secondPayload
  let thirdPayload
  let fourthPayload
  const analytics = Analytics({
    plugins: [
      {
        name: 'enrich-four',
        'track:plugin-four': ({ payload }) => {
          firstPayload = payload
          return {
            ...payload,
            ...{
              addToFourOnly: 'hello'
            }
          }
        }
      },
      {
        name: 'plugin-one',
        track: ({ payload }) => {
          firstPayload = payload
          return {
            ...payload,
            ...{
              foo: 'baz'
            }
          }
        }
      },
      {
        name: 'plugin-two',
        track: ({ payload }) => {
          secondPayload = payload
          return {
            ...payload,
            ...{
              fizz: 'pop'
            }
          }
        }
      },
      {
        name: 'plugin-three',
        track: ({ payload }) => {
          thirdPayload = payload
        }
      },
      {
        name: 'plugin-four',
        track: ({ payload }) => {
          fourthPayload = payload
        }
      },
    ]
  })

  analytics.track('foobar')
  const anonId = analytics.user('anonymousId')

  await delay(100)

  const originalPayload = {
    type: 'track',
    event: 'foobar',
    properties: {},
    options: {},
    userId: null,
    anonymousId: anonId,
    // meta: { timestamp: 1571017886122 }
  }

  delete firstPayload.meta
  assert.equal(firstPayload, originalPayload)

  delete secondPayload.meta
  assert.equal(secondPayload, originalPayload)

  delete thirdPayload.meta
  assert.equal(thirdPayload, originalPayload)

  delete fourthPayload.meta
  assert.equal(fourthPayload, {
    type: 'track',
    event: 'foobar',
    properties: {},
    options: {},
    userId: null,
    anonymousId: anonId,
    addToFourOnly: 'hello'
  })
})

test('Namespace plugin should enrich specific data', async () => {
  let payloadOne
  let payloadOriginal
  const analytics = Analytics({
    app: 'appname',
    version: 100,
    plugins: [
      {
        name: 'enrich-one',
        // Only enrich plugin-one
        'track:plugin-one': ({ payload }) => {
          return {
            ...payload,
            ...{
              foo: 'baz'
            }
          }
        }
      },
      {
        name: 'plugin-one',
        track: ({ payload }) => {
          payloadOne = payload
        }
      },
      {
        name: 'plugin-two',
        track: ({ payload }) => {
          payloadOriginal = payload
        }
      },
    ]
  })

  analytics.track('lol')
  const anonId = analytics.user('anonymousId')

  await delay(100)

  delete payloadOne.meta
  assert.equal(payloadOne, {
    type: 'track',
    event: 'lol',
    properties: {},
    options: {},
    userId: null,
    anonymousId: anonId,
    foo: 'baz',
  })

  delete payloadOriginal.meta
  assert.equal(payloadOriginal, {
    type: 'track',
    event: 'lol',
    properties: {},
    options: {},
    userId: null,
    anonymousId: anonId
  })
})

test('Multiple Namespaced plugins should enrich specific data', async () => {
  let payloadOne
  let payloadTwo
  const analytics = Analytics({
    app: 'appname',
    version: 100,
    plugins: [
      {
        name: 'enrich-one',
        // Only enrich plugin-one
        'track:plugin-one': ({ payload }) => {
          return {
            ...payload,
            ...{
              foo: 'baz'
            }
          }
        }
      },
      {
        name: 'enrich-one-b',
        // Only enrich plugin-one
        'track:plugin-one': ({ payload }) => {
          return {
            ...payload,
            ...{
              wowowow: 'nice'
            }
          }
        }
      },
      {
        name: 'enrich-two',
        // Only enrich plugin-one
        'track:plugin-two': ({ payload }) => {
          return {
            ...payload,
            ...{
              awesome: 'sauce'
            }
          }
        }
      },
      {
        name: 'plugin-one',
        track: ({ payload }) => {
          payloadOne = payload
        }
      },
      {
        name: 'plugin-two',
        track: ({ payload }) => {
          payloadTwo = payload
        }
      },
    ]
  })

  analytics.track('lol')
  const anonId = analytics.user('anonymousId')

  await delay(100)

  delete payloadOne.meta
  assert.equal(payloadOne, {
    type: 'track',
    event: 'lol',
    properties: {},
    options: {},
    userId: null,
    anonymousId: anonId,
    foo: 'baz',
    wowowow: 'nice'
  })

  delete payloadTwo.meta
  assert.equal(payloadTwo, {
    type: 'track',
    event: 'lol',
    properties: {},
    options: {},
    userId: null,
    anonymousId: anonId,
    awesome: 'sauce'
  })
})

test.run()
