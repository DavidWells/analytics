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

test('Instance should not call any initialize if aborted', async () => {
  const initializeOne = sandbox.spy()
  const initializeTwo = sandbox.spy()
  const analytics = Analytics({
    app: 'appname',
    version: 100,
    plugins: [
      {
        name: 'cancel-plugin-loading',
        initializeStart: ({ payload }) => {
          return {
            abort: true
          }
        }
      },
      {
        name: 'plugin-one',
        initialize: initializeOne
      },
      {
        name: 'plugin-two',
        initialize: initializeTwo
      }
    ]
  })

  await delay(50) // Reduced from 100ms to 50ms

  assert.is(initializeOne.callCount, 0)
  assert.is(initializeTwo.callCount, 0)
})

test('Instance should not call specific initialize if plugin aborted by name', async () => {
  const initializeOne = sandbox.spy()
  const initializeTwo = sandbox.spy()
  const analytics = Analytics({
    app: 'appname',
    version: 100,
    plugins: [
      {
        name: 'cancel-plugin-loading',
        initializeStart: ({ payload }) => {
          return {
            abort: {
              plugins: ['plugin-one']
            }
          }
        }
      },
      {
        name: 'plugin-one',
        initialize: initializeOne
      },
      {
        name: 'plugin-two',
        initialize: initializeTwo
      }
    ]
  })

  await delay(50) // Reduced from 100ms to 50ms

  assert.is(initializeOne.callCount, 0)
  assert.is(initializeTwo.callCount, 1)
})

test.run()
