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

test.after(() => {
  sandbox.restore()
})

test('Lifecycle should execute in correct order', async () => {
  const executionOrder = []
  const pageStartListener = sandbox.spy()
  const pageListener = sandbox.spy()
  const pageEndListener = sandbox.spy()

  const pageStartMethod = sandbox.spy()
  const pageMethod = sandbox.spy()
  const pageEndMethod = sandbox.spy()
  const secondPageStartMethod = sandbox.spy()
  const secondPageMethod = sandbox.spy()
  const secondPageEndMethod = sandbox.spy()

  const analytics = Analytics({
    app: 'appname',
    version: 100,
    plugins: [{
      name: 'plugin-one',
      bootstrap: ({ abort, config, instance }) => {
        executionOrder.push('From method: bootstrap')
        instance.on('pageStart', () => {
          executionOrder.push('.on("pageStart") listener from plugin')
          pageStartListener()
        })
        instance.on('page', () => {
          executionOrder.push('.on("page") listener from plugin')
          pageListener()
        })
        instance.on('pageEnd', () => {
          executionOrder.push('.on("pageEnd") listener from plugin')
          pageEndListener()
        })
        instance.on('pageStart:plugin-two', () => {
          executionOrder.push('.on("pageStart:plugin-two") listener from plugin')
        })
        instance.on('page:plugin-two', () => {
          executionOrder.push('.on("page:plugin-two") listener from plugin')
        })
        instance.on('pageEnd:plugin-two', () => {
          executionOrder.push('.on("pageEnd:plugin-two") listener from plugin')
        })
      },
      pageStart: ({ abort, config }) => {
        executionOrder.push('From method: pageStart:plugin-one')
        pageStartMethod()
        // console.log('1. pageStart')
      },
      page: ({ abort, config }) => {
        executionOrder.push('From method: page:plugin-one')
        pageMethod()
        // console.log('2. page')
      },
      pageEnd: ({ abort, config }) => {
        executionOrder.push('From method: pageEnd:plugin-one')
        pageEndMethod()
        // console.log('3. pageEnd')
      },
      ready: () => {
        executionOrder.push('From method: ready:plugin-one')
      }
    },
    {
      name: 'plugin-two',
      bootstrap: ({ abort, config, instance }) => {
        executionOrder.push('From method: bootstrap two')
      },
      pageStart: ({ abort, config }) => {
        executionOrder.push('From method: pageStart:plugin-two')
        secondPageStartMethod()
      },
      page: ({ abort, config }) => {
        executionOrder.push('From method: page:plugin-one')
        secondPageMethod()
      },
      pageEnd: ({ abort, config }) => {
        executionOrder.push('From method: pageEnd:plugin-two')
        secondPageEndMethod()
      },
      ready: () => {
        executionOrder.push('From method: ready:plugin-two')
      }
    }]
  })

  analytics.on('pageStart', () => {
    executionOrder.push('.on("pageStart") listener')
  })

  analytics.on('page', () => {
    executionOrder.push('.on("page") listener')
  })

  analytics.on('pageEnd', () => {
    executionOrder.push('.on("pageEnd") listener')
  })

  analytics.on('ready', ({ payload }) => {
    executionOrder.push('.on("ready") listener')
  })
  analytics.ready(({ payload }) => {
    executionOrder.push('.ready() listener')
  })

  // await delay(0)
  analytics.ready(() => {
    analytics.page(() => {
      executionOrder.push('.page() callback')
    })
  })

  await delay(200) // Reduced from 2000ms to 200ms
  assert.is(pageMethod.callCount, 1)
  assert.equal(executionOrder, [
    // Bootstrap
    'From method: bootstrap',
    'From method: bootstrap two',
    // Ready
    'From method: ready:plugin-one',
    'From method: ready:plugin-two',
    '.on("ready") listener',
    '.ready() listener',
    // PageStart
    '.on("pageStart") listener from plugin',
    '.on("pageStart") listener',
    'From method: pageStart:plugin-one',
    'From method: pageStart:plugin-two',
    '.on("pageStart:plugin-two") listener from plugin',
    // Page
    'From method: page:plugin-one',
    'From method: page:plugin-one',
    '.on("page:plugin-two") listener from plugin',
    '.on("page") listener from plugin',
    '.on("page") listener',
    // PageEnd
    'From method: pageEnd:plugin-one',
    'From method: pageEnd:plugin-two',
    '.on("pageEnd:plugin-two") listener from plugin',
    '.on("pageEnd") listener from plugin',
    '.on("pageEnd") listener',
    // page callback
    '.page() callback'
  ])
  // console.log('executionOrder', executionOrder)
})

test.run()
