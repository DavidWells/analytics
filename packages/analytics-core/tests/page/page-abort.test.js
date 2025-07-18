import '../_setup.js'
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import sinon from 'sinon'
import delay from '../_utils/delay.js'
import Analytics from '../../src/index.js'

let sandbox

test.before(() => {
  sandbox = sinon.createSandbox()
})

test('should abort calls', async () => {
  const pageSpy = sandbox.spy()
  const pageSpyTwo = sandbox.spy()

  const analytics = Analytics({
    plugins: [
      {
        name: 'test-plugin',
        page: ({ payload }) => {
          pageSpy()
          return {
            abort: true
          }
        }
      },
      {
        name: 'test-plugin-two',
        page: () => {
          pageSpyTwo()
        }
      }
    ]
  })

  analytics.page()

  // Timeout for async actions to fire
  await delay(100)

  // Ensure the page was called
  assert.is(pageSpy.callCount, 1)

  // Ensure pageSpyTwo wasnt called because earlier abort
  assert.is(pageSpyTwo.callCount, 0)
})

test('should abort only specific plugins if abort.plugins array supplied', async () => {
  const pageSpy = sandbox.spy()
  const pageSpyTwo = sandbox.spy()
  const pageSpyThree = sandbox.spy()

  const analytics = Analytics({
    plugins: [
      {
        name: 'test-plugin',
        page: ({ payload }) => {
          pageSpy()
          return {
            ...payload,
            ...{
              abort: {
                plugins: ['test-plugin-two']
              }
            }
          }
        }
      },
      {
        name: 'test-plugin-two',
        page: () => {
          pageSpyTwo()
        }
      },
      {
        name: 'test-plugin-three',
        page: () => {
          pageSpyThree()
        }
      }
    ]
  })

  analytics.page()

  // Timeout for async actions to fire
  await delay(100)

  // Ensure the page was called
  assert.equal(pageSpy.callCount, 1)

  // Ensure pageSpyTwo wasnt called because earlier abort
  assert.equal(pageSpyTwo.callCount, 0)

  assert.equal(pageSpyThree.callCount, 1)
})

test.run()
