import { test } from 'uvu'
import * as t from 'uvu/assert'
import smartQueue from '../src'

const noOp = (arr) => {
  // console.log('process items', arr)
}
const sleep = ms => new Promise(r => setTimeout(r, ms))

test('exports', () => {
	t.type(smartQueue, 'function')
  const queue = smartQueue(noOp)
	t.is(typeof queue, 'object', 'returns an object')
	t.is(typeof queue.flush, 'function', '~> has "flush" function')
  t.is(typeof queue.resume, 'function', '~> has "resume" function')
	t.is(typeof queue.push, 'function', '~> has "push" function')
	t.is(typeof queue.size, 'function', '~> has "size" function')
	t.is(typeof queue.pause, 'function', '~> has "pause" function')
  queue.pause()
})

test('Starts in idle if queue empty', () => {
	t.type(smartQueue, 'function')
  const timer = new Timer()
  const ctx = smartQueue(noOp, { interval: 1000 })
  // Queue is empty
	t.is(ctx.size(), 0)
  const end = timer.runtimeMs()
  // Queue releases immediatly if no items
	t.is(end < 0.2, true)
})

function asyncQueue() {
  return new Promise((res) => {
    const timer = new Timer()
    const queue = smartQueue(noOp, {
      max: 7,
      interval: 1000,
      throttle: true,
      onEmpty: () => {
        const timeEnd = timer.runtimeMs()
        return res(timeEnd)
      }
    })
    addItems(queue, 25)
  })
}

test('Processes queue', async () => {
  const fin = await asyncQueue()
	t.is(fin < 5000, true)
})

test('queue.push', () => {
  const queue = smartQueue(noOp, {
    interval: 2000,
  })
	const foo = queue.push('hello')
	t.is(foo, 1, '~> returns the current queue length')

	const bar = queue.push('world')
	t.is(bar, 2, '~> returns the current queue length')
	queue.pause()
})

test('queue.size', () => {
  const queue = smartQueue(noOp, {
    interval: 1000,
  })

	queue.push('hello')
	const foo = queue.size()
	t.is(foo, 1, '~> returns the current queue length')

	queue.push('world')
	const bar = queue.size()
	t.is(bar, 2, '~> returns the current queue length')

	queue.pause()
})

test('queue.flush', () => {
  const queue = smartQueue((arr) => {
		t.is(arr.length, 2, '~> received 2 items')

		const val = queue.size()
		t.is(val, 0, '~> caller sees 0 queue size')
  }, {
    interval: 1000,
  })

	queue.push('hello')
	queue.push('world')
	t.is(queue.size(), 2, '(before) has 2 items')
	queue.flush()
	t.is(queue.size(), 0, '(after) has 0 items')

	queue.pause()
})

test('queue.pause', () => {
  let shouldBeFalse = false
  const queue = smartQueue((arr) => {
    shouldBeFalse = true
  }, {
    interval: 1000,
    onPause: () => {
      t.is(shouldBeFalse, false)
    }
  })

	queue.push('hello')
	queue.push('world')

	t.is(queue.size(), 2, '(before) has 2 items')
	queue.pause()
	t.is(queue.size(), 2, '(after) has 2 items')
})

test('$.pause(true)', () => {
	const queue = smartQueue(arr => {
		t.is(arr.length, 2, '~> received 2 items')

		const val = queue.size()
		t.is(val, 0, '~> caller sees 0 queue size')
	})

	queue.push('hello')
	queue.push('world')

	t.is(queue.size(), 2, '(before) has 2 items')
	queue.pause(true)
	t.is(queue.size(), 0, '(after) has 0 items')
})

test('opts.max', () => {
	const now = Date.now()
	const queue = smartQueue(arr => {
		let del = Date.now() - now
		t.ok(Array.isArray(arr), 'caller receives Array of items')
		t.ok(del < 3000, '~> ran before 3s interval')
		t.is(arr.length, 10, '~> received 10 items')
	}, {
		max: 10,
		interval: 3000
	})

	Array.from({ length: 5 }, queue.push)

	queue.pause()
})

test('opts.interval', async () => {
	const now = Date.now()
	const queue = smartQueue(arr => {
		let del = Date.now() - now
		t.ok(Array.isArray(arr), 'caller receives Array of items')
		t.ok(del > 3e3, '~> ran after 3s interval')
		t.is(arr.length, 5, '~> received 5 items')
		t.is(queue.size(), 0, '~> instance fully drained')
	}, {
		interval: 3e3
	})

	Array.from({ length:5 }, queue.push)

	t.is(queue.size(), 5, '(before) has 5 items')
	await sleep(5e3)
	t.is(queue.size(), 0, '(after) has 0 items')

	queue.pause()
})

test.run()

function addItems(queue, length = 20) {
  Array.from(Array(length).keys()).forEach((x) => {
    queue.push(x)
  })
}

class Timer {
  constructor(name = 'Benchmark') {
    this.NS_PER_SEC = 1e9
    this.MS_PER_NS = 1e-6
    this.name = name
    this.startTime = process.hrtime()
  }
  runtimeMs() {
    const diff = process.hrtime(this.startTime)
    return (diff[0] * this.NS_PER_SEC + diff[1]) * this.MS_PER_NS
  }
}