import test from 'ava'
import sinon from 'sinon'
import delay from './utils/delay'
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
      NAMESPACE: 'plugin-one',
      bootstrap: ({ abort, config, instance }) => {
        executionOrder.push('bootstrap')
        instance.on('pageStart', () => {
          executionOrder.push('pageStart listener from plugin')
          pageStartListener()
        })
        instance.on('page', () => {
          executionOrder.push('page listener from plugin')
          pageListener()
        })
        instance.on('pageEnd', () => {
          executionOrder.push('pageEnd listener from plugin')
          pageEndListener()
        })
        instance.on('pageStart:plugin-two', () => {
          executionOrder.push('on("pageStart:plugin-two")')
        })
        instance.on('page:plugin-two', () => {
          executionOrder.push('on("page:plugin-two")')
        })
        instance.on('pageEnd:plugin-two', () => {
          executionOrder.push('on("pageEnd:plugin-two")')
        })
      },
      pageStart: ({ abort, config }) => {
        executionOrder.push('pageStart:plugin-one')
        pageStartMethod()
        console.log('1. pageStart')
      },
      page: ({ abort, config }) => {
        executionOrder.push('page:plugin-one')
        pageMethod()
        console.log('2. page')
      },
      pageEnd: ({ abort, config }) => {
        executionOrder.push('pageEnd:plugin-one')
        pageEndMethod()
        console.log('3. pageEnd')
      },
      ready: () => {
        executionOrder.push('ready:plugin-one')
      }
    },
    {
      NAMESPACE: 'plugin-two',
      bootstrap: ({ abort, config, instance }) => {
        executionOrder.push('bootstrap two')
      },
      pageStart: ({ abort, config }) => {
        executionOrder.push('pageStart:plugin-two')
        secondPageStartMethod()
      },
      page: ({ abort, config }) => {
        executionOrder.push('page:plugin-two')
        secondPageMethod()
      },
      pageEnd: ({ abort, config }) => {
        executionOrder.push('pageEnd:plugin-two')
        secondPageEndMethod()
      },
      ready: () => {
        executionOrder.push('ready:plugin-two')
      }
    }]
  })

  analytics.on('pageStart', () => {
    executionOrder.push('pageStart listener')
  })

  analytics.on('page', () => {
    executionOrder.push('page listener')
  })

  analytics.on('pageEnd', () => {
    executionOrder.push('pageEnd listener')
  })

  analytics.on('ready', ({ payload }) => {
    executionOrder.push('ready listener')
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
    'bootstrap',
    'bootstrap two',
    'ready:plugin-one',
    'ready:plugin-two',
    'ready listener',
    '.ready() listener',
    'pageStart listener from plugin',
    'pageStart listener',
    'pageStart:plugin-one',
    'pageStart:plugin-two',
    'on("pageStart:plugin-two")',
    'page:plugin-one',
    'page:plugin-two',
    'on("page:plugin-two")',
    'page listener from plugin',
    'page listener',
    'pageEnd:plugin-one',
    'pageEnd:plugin-two',
    'on("pageEnd:plugin-two")',
    'pageEnd listener from plugin',
    'pageEnd listener',
    '.page() callback'
  ])
  // console.log('executionOrder', executionOrder)
})
