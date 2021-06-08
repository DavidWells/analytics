const noOp = () => {}

export default function smartQueue(handler, opts) {
  opts = opts || {}
  var timer, tmp, running
  var queue = opts.initial || []
  var max = opts.max || Infinity
  var int = opts.interval || 10e3
  var onEmpty = opts.onEmpty || noOp
  var onPause = opts.onPause || noOp

  function batch(all) {
    clearInterval(timer)
    var removed = queue.splice(0, max)
    /* If queue chunk has no items */
    // if (!removed.length) {
    //   running = false
    //   return onEnd(queue, 'process-empty')
    // }
    if (removed.length) {
      handler(removed, queue)
    }
    /* If queue backlog has no items */
    if (!queue.length) {
      running = false
      // return onEnd(queue, 'end')
      return onEmpty(queue)
    }

    if (all) {
      return batch()
    }
    return ticker()
  }

  function ticker() {
    running = true
    timer = setInterval(batch, int)
  }

  // Start queue if items
  if (queue.length) {
    ticker()
  }

  return {
    flush: function(all) {
      batch(all)
    },
    resume: batch,
    push: function(val) {
      tmp = queue.push(val)
      /* Clear if overflow */
      if (tmp >= max && !opts.throttle) {
        batch() // immediately process overflow in queue
      }
      if (!running) {
        ticker()
      }
      return tmp
    },
    size: function() {
      return queue.length
    },
    pause: function(toFlush) {
      if (toFlush) batch()
      clearInterval(timer)
      running = false
      onPause(queue)
      // onEmpty(queue, 'end-called')
    }
    // end === pause
  }
}