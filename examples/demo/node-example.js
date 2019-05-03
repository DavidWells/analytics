const { analytics } = require('analytics')
const two = require('analytics-utils')
const testPlugin = require('analytics-plugin-lifecycle-example')

const a = analytics({
  app: 'node-app',
})

a.on('*', ({ payload }) => {
  console.log(`* listener ${payload.type}`)
})

a.on('pageEnd', ({ payload }) => {
  console.log(`pageEnd listener ${payload.type}`)
})

a.page(() => {
  console.log('lol')
})
