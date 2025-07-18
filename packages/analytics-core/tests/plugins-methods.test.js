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

test('Plugin Methods should fire correct order', async () => {
  let instanceTestOne, instanceTestTwo, argsToPass, argsToPassTwo
  const customMethodFunc = sandbox.spy()
  const trackListener = sandbox.spy()
  const pageListener = sandbox.spy()

  const analytics = Analytics({
    app: 'cool-app',
    plugins: [{
      name: 'pluginOne',
      /* Functions to expose to analytics instance */
      methods: {
        one(one, two, three) {
          instanceTestOne = this.instance
          customMethodFunc()
        },
        two: (one, ...args) => {
          // Arrow functions break this.x context. The instance is instead injected as last arg
          const instance = args[args.length - 1]
          instanceTestTwo = instance
        },
        async three(one, two, three) {
          argsToPass = [ one, two, three ]
          return Promise.resolve('wooo')
        },
        four: async (one, two, three) => {
          return Promise.resolve('hooray')
        },
      }
    },
    {
      name: 'two',
      methods: {
        customThing(one, two, three) {
          const { page } = this.instance
          // Call page from analytics.page
          page()
        },
        niceFunc: (one, two, ...args) => {
          argsToPassTwo = [ one, two ]
          // Arrow functions break this.x context. The instance is instead injected as last arg
          const instance = args[args.length - 1]
          const { track } = instance
          instance.track('myCustomThing')
        },
        three(one, two, three) {
          return Promise.resolve('wooo')
        },
      }
    }]
  })

  analytics.on('track', trackListener)
  analytics.on('page', pageListener)

  analytics.plugins['pluginOne'].one()
  analytics.plugins['pluginOne'].two()

  analytics.plugins.two.customThing()
  analytics.plugins.two.niceFunc('nice', { groovy: true })

  const valueThree = await analytics.plugins.pluginOne.three('1', '2', '3')
  const valueFour = await analytics.plugins.pluginOne.four()

  await delay(2000)
  // one was called once
  assert.is(customMethodFunc.callCount, 1)
  const mainApiKeys = Object.keys(analytics)
  assert.equal(Object.keys(instanceTestOne), mainApiKeys)
  assert.equal(Object.keys(instanceTestTwo), mainApiKeys)
  assert.is(valueThree, 'wooo')
  assert.is(valueFour, 'hooray')
  // console.log('executionOrder', executionOrder)

  assert.is(trackListener.callCount, 1)
  assert.is(pageListener.callCount, 1)

  assert.equal(argsToPass, ['1', '2', '3'])
  assert.equal(argsToPassTwo, ['nice', { groovy: true }])

})

test.run()
