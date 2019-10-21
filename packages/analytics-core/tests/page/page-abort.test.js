import test from 'ava'
import sinon from 'sinon'
import delay from '../utils/delay'
import Analytics from '../../src'

test.beforeEach((t) => {
  t.context.sandbox = sinon.createSandbox()
})

test('should abort calls', async (t) => {
  const pageSpy = t.context.sandbox.spy()
  const pageSpyTwo = t.context.sandbox.spy()

  const analytics = Analytics({
    plugins: [
      {
        NAMESPACE: 'test-plugin',
        page: ({ payload }) => {
          pageSpy()
          return {
            abort: true
          }
        }
      },
      {
        NAMESPACE: 'test-plugin-two',
        page: () => {
          pageSpyTwo()
        }
      }
    ]
  })

  analytics.page()

  // Timeout for async actions to fire
  await delay(1000)

  // Ensure the page was called
  t.is(pageSpy.callCount, 1)

  // Ensure pageSpyTwo wasnt called because earlier abort
  t.is(pageSpyTwo.callCount, 0)
})

test('should abort only specific plugins if abort.plugins array supplied', async (t) => {
  const pageSpy = t.context.sandbox.spy()
  const pageSpyTwo = t.context.sandbox.spy()
  const pageSpyThree = t.context.sandbox.spy()

  const analytics = Analytics({
    plugins: [
      {
        NAMESPACE: 'test-plugin',
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
        NAMESPACE: 'test-plugin-two',
        page: () => {
          pageSpyTwo()
        }
      },
      {
        NAMESPACE: 'test-plugin-three',
        page: () => {
          pageSpyThree()
        }
      }
    ]
  })

  analytics.page()

  // Timeout for async actions to fire
  await delay(1000)

  // Ensure the page was called
  t.deepEqual(pageSpy.callCount, 1)

  // Ensure pageSpyTwo wasnt called because earlier abort
  t.deepEqual(pageSpyTwo.callCount, 0)

  t.deepEqual(pageSpyThree.callCount, 1)
})
