<!--
title: Javascript queue util
pageTitle: Queue Utils
description: Utility library for queuing events
-->

# Queue Utility

A simple tiny queue library in <!-- AUTO-GENERATED-CONTENT:START (pkgSize) -->`352 bytes`<!-- AUTO-GENERATED-CONTENT:END -->.

```js
import smartQueue from '@analytics/queue-utils'

// Queue options
const options = {
  max: 10, // limit
  interval: 3000, // 3s
  throttle: true, // Ensure only max is processed at interval
  onPause: () => {
    console.log('queue paused')
  },
  onEmpty: (queue, type) => {
    if (!queue.length) {
      console.log('>>>>>>>> Queue empty! Halted processing')
    } else {
      console.log('Queue remaining', queue)
      console.log('start with queue.resume()')
    }
  }
}

const queue = smartQueue((items, restOfQueue) => {
  console.log('items to process', items)
  console.log('rest of queue', rest)
}, options)

;[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].forEach((item) => {
  // Push items to queue
  queue.push(item)
})

// Get queue size
console.log(queue.size())

// Pause queue
queue.pause()

// Resume queue
queue.resume()
```

## Prior art

Fork of [saturated](https://github.com/lukeed/saturated)