<!--
title: Javascript queue util
pageTitle: Queue Utils
description: Utility library for queuing events
-->

# Queue Utility

A simple tiny queue library.

```js
import smartQueue from '@analytics/queue-utils'

const queue = smartQueue((items, rest) => {
  console.log('~> Received')
  console.log('Process items', items)
  console.log('Left to process', rest)
}, options)

queue.push(22)
queue.push(33)

;[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].forEach((x) => {
  queue.push(x)
})

queue.pause()

queue.push('restart with push')
```

## Prior art

Fork of [saturated](https://github.com/lukeed/saturated)