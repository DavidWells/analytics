const { analytics } = require('analytics')
const segmentPlugin = require('analytics-plugin-segment')
const customerioPlugin = require('analytics-plugin-customerio')

const a = analytics({
  app: 'node-app',
  plugins: [
    segmentPlugin({
      writeKey: 'xyz',
      // disableAnonymousTraffic: true
    }),
    customerioPlugin({
      siteId: '1111',
      apiKey: 'cccc'
    }),
    {
      NAMESPACE: 'tester',
      ready: () => {
        console.log('ok')
      }
    }
  ]
})

a.on('*', ({ payload }) => {
  console.log(`* listener ${payload.type}`)
})

const userId = 'user-in-node-444'
const anonymousId = '231231322331312'

/*
a.identify('user-in-node-444', {
  color: 'green',
})
/**/


a.track('a', {
  price: 20,
  userId: userId,
  anonymousId: anonymousId
}, () => {
  console.log('Callback 1')
})

a.track('b', {
  price: 20,
  userId: userId,
  anonymousId: anonymousId
}, () => {
  console.log('Callback 2')
})

a.track('c', {
  price: 20,
  userId: userId,
  anonymousId: anonymousId
}, () => {
  console.log('Callback 3')
})

a.ready(() => {
  console.log('Analytics Ready')
  console.log(a.getState())
})
