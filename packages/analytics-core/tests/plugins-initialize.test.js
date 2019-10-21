import test from 'ava'
import sinon from 'sinon'
import delay from './utils/delay'
import Analytics from '../src'

test.beforeEach((t) => {
  t.context.sandbox = sinon.createSandbox()
})

test('Instance should not call any initialize if aborted', async (t) => {
  const initializeOne = t.context.sandbox.spy()
  const initializeTwo = t.context.sandbox.spy()
  const analytics = Analytics({
    app: 'appname',
    version: 100,
    plugins: [
      {
        NAMESPACE: 'cancel-plugin-loading',
        initializeStart: ({ payload }) => {
          return {
            abort: true
          }
        }
      },
      {
        NAMESPACE: 'plugin-one',
        initialize: initializeOne
      },
      {
        NAMESPACE: 'plugin-two',
        initialize: initializeTwo
      }
    ]
  })

  await delay(1000)

  t.is(initializeOne.callCount, 0)
  t.is(initializeTwo.callCount, 0)
})

test('Instance should not call specific initialize if plugin aborted by name', async (t) => {
  const initializeOne = t.context.sandbox.spy()
  const initializeTwo = t.context.sandbox.spy()
  const analytics = Analytics({
    app: 'appname',
    version: 100,
    plugins: [
      {
        NAMESPACE: 'cancel-plugin-loading',
        initializeStart: ({ payload }) => {
          return {
            abort: {
              plugins: ['plugin-one']
            }
          }
        }
      },
      {
        NAMESPACE: 'plugin-one',
        initialize: initializeOne
      },
      {
        NAMESPACE: 'plugin-two',
        initialize: initializeTwo
      }
    ]
  })

  await delay(1000)

  t.is(initializeOne.callCount, 0)
  t.is(initializeTwo.callCount, 1)
})
