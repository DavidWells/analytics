import test from 'ava'
import sinon from 'sinon'
import delay from './_utils/delay'
import Analytics from '../src'

test.beforeEach((t) => {
  t.context.sandbox = sinon.createSandbox()
})

test('Lifecycle should execute in correct order', async (t) => {
  const executionOrder = []
  const { context } = t
  const pageStartListener = context.sandbox.spy()
  const pageListener = context.sandbox.spy()
  const pageEndListener = context.sandbox.spy()

  const pageStartMethod = context.sandbox.spy()
  const pageMethod = context.sandbox.spy()
  const pageEndMethod = context.sandbox.spy()
  const secondPageStartMethod = context.sandbox.spy()
  const secondPageMethod = context.sandbox.spy()
  const secondPageEndMethod = context.sandbox.spy()

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

  await delay(2000)
  t.is(pageMethod.callCount, 1)
  t.deepEqual(executionOrder, [
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
