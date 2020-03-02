import test from 'ava'
import sinon from 'sinon'
import Analytics from '../src'

test.beforeEach((t) => {
  t.context.sandbox = sinon.createSandbox()
})

test.cb('Plugins should have correct config in methods', (t) => {
  let valueOne
  let valueTwo
  const analytics = Analytics({
    app: 'appname',
    version: 100,
    plugins: [
      {
        name: 'pluginA',
        config: {
          test: 'A'
        },
        'page:pluginB': ({ config }) => {
          valueOne = config.test // should be A
        }
      },
      {
        name: 'pluginB',
        config: {test: 'B'},
        page: ({ config }) => {
          valueTwo = config.test // should be B
        }
      }
    ]
  })

  analytics.page(() => {
    t.is(valueOne, 'A')
    t.is(valueTwo, 'B')
    t.end()
  })
})
