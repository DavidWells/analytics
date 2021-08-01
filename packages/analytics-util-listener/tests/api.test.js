
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import * as ENV from './setup/env'

test.before(ENV.setup);
// test.before.each(ENV.reset);
test.after(() => console.log('tests done'))

test('API is exposed', async (context) => {
	assert.ok(window['utilListener'])

  assert.ok(window['utilListener'].removeListener)
  assert.ok(window['utilListener'].addListener)
  assert.ok(window['utilListener'].once)

  assert.is(typeof window['utilListener'].removeListener, 'function')
  assert.is(typeof window['utilListener'].addListener, 'function')
  assert.is(typeof window['utilListener'].once, 'function')
})

test('Heading click handler works', async () => {
  const heading = ENV.getSelector('#heading')
  // initial style empty
	assert.is(heading.style.color === '', true)
  // click
  heading.click()
  // Has random style
  assert.is(heading.style.color !== '', true)
})

/* Once listener works */
test('{ once : true }', async () => {
  const button = ENV.getSelector('#once')
  assert.ok(button)
  assert.is(window['onceCount'] === 0, true)
  button.click()
  assert.is(window['onceCount'] === 1, true)
  button.click()
  button.click()
  button.click()
  assert.is(window['onceCount'] === 1, true)
})

/* Listeners are recursive in nature */
test('Ensure recursive attach/detach', async () => {
  let count = 0
  const { addListener } = window.utilListener
  const testNode = ENV.getSelector('#tester')
  
  // Attach listener
  const tearDownOne = addListener('#tester', 'click', () => {
    count = count + 1
  })

  testNode.click()
  assert.is(typeof tearDownOne, 'function')
  assert.is(count, 1)
  await delay()

  // Disable listener
  const setupTwo = tearDownOne()
  assert.is(typeof setupTwo, 'function')
  testNode.click()
  testNode.click()
  testNode.click()
  assert.is(count, 1)

  await delay()

  // enable listener
  const tearDownThree = setupTwo()
  assert.is(typeof tearDownThree, 'function')
  testNode.click()
  testNode.click()
  assert.is(count, 3)
  await delay()
  
  // Disable listener
  const setupFour = tearDownThree()
  assert.is(typeof setupFour, 'function')
  testNode.click()
  testNode.click()
  testNode.click()
  assert.is(count, 3)
})

function delay(ms = 300) {
  return new Promise(res => setTimeout(res, ms))
}

test.run()
