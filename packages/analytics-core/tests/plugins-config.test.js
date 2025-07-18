import './_setup.js'
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import sinon from 'sinon'
import Analytics from '../src/index.js'

let sandbox

test.before(() => {
  sandbox = sinon.createSandbox()
})

test('Plugins should have correct config in methods', async () => {
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

  await analytics.page()
  
  assert.is(valueOne, 'A')
  assert.is(valueTwo, 'B')
})

test.run()
