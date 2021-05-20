// Run build to run example
const smartQueue = require('./dist/analytics-util-queue.umd.js')

const options = {
  max: 10, // limit
  interval: 3000, // 3s
  throttle: true, // Ensure only max is processed at interval
  onPause: (queue) => {
    console.log('> Paused!')
    console.log('Remaining items', queue)
  },
  onEmpty: () => {
    console.log('> Queue empty and idled')
  }
}

const queue = smartQueue((items, rest) => {
  console.log('items to process', items)
  console.log('rest of queue', rest)
  console.log(new Date().toISOString())
}, options)

queue.push('xy')
queue.push('ab')

Array.from(Array(23).keys()).forEach((x) => {
  queue.push(x)
})

setTimeout(() => {
  console.log('PAUSED')
  queue.pause()
}, 3500);


setTimeout(() => {
  console.log('RESUMED')
  queue.resume()
}, 13000)