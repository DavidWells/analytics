const analytics = require('analytics')

const mainEntry = require('@analytics/core')
console.log('mainEntry', mainEntry)

const server = require('@analytics/core/server')
console.log('server', server)

const client = require('@analytics/core/client')
console.log('client', client)

const instance = server.Analytics({
  app: 'node-app',
  plugins: []
})

console.log('instance', instance)

// a.on('*', ({ payload }) => {
//   console.log(`* listener ${payload.type}`)
// })

// const userId = 'user-in-node-444'
// const anonymousId = '231231322331312'

// /*
// a.identify('user-in-node-444', {
//   color: 'green',
// })
// /**/


// a.track('a', {
//   price: 20,
//   userId: userId,
//   anonymousId: anonymousId
// }, () => {
//   console.log('Callback 1')
// })

// a.track('b', {
//   price: 20,
//   userId: userId,
//   anonymousId: anonymousId
// }, () => {
//   console.log('Callback 2')
// })

// a.track('c', {
//   price: 20,
//   userId: userId,
//   anonymousId: anonymousId
// }, () => {
//   console.log('Callback 3')
// })

// a.ready(() => {
//   console.log('Analytics Ready')
//   console.log(a.getState())
// })
