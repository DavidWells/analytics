import test from 'ava'
import sinon from 'sinon'
import delay from './_utils/delay'
import Analytics from '../src'

test.beforeEach((t) => {
  t.context.sandbox = sinon.createSandbox()
})

test('Plugin Methods should fire correct order', async (t) => {
  const { context } = t
  let instanceTestOne, instanceTestTwo, argsToPass, argsToPassTwo
  const customMethodFunc = context.sandbox.spy()
  const trackListener = context.sandbox.spy()
  const pageListener = context.sandbox.spy()

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
  t.is(customMethodFunc.callCount, 1)
  const mainApiKeys = Object.keys(analytics)
  t.deepEqual(Object.keys(instanceTestOne), mainApiKeys)
  t.deepEqual(Object.keys(instanceTestTwo), mainApiKeys)
  t.is(valueThree, 'wooo')
  t.is(valueFour, 'hooray')
  // console.log('executionOrder', executionOrder)

  t.is(trackListener.callCount, 1)
  t.is(pageListener.callCount, 1)

  t.deepEqual(argsToPass, ['1', '2', '3'])
  t.deepEqual(argsToPassTwo, ['nice', { groovy: true }])

})
