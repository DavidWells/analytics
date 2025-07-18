import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { formatPayload } from '../src/browser.js'

/*
Verify Fullstory formatter
https://help.fullstory.com/hc/en-us/articles/360020623234
*/

const traits = {
  displayName: 'jim',
  color: 'blue',
  cool: false,
  count_int: 10,
  test_snake_case: 'wow',
  weird_array_thing: ['wow', 'rad', 'nice'],
  array_of_booleans: [true, false, true],
  lol: 1.2,
}

test('FullStory Traits Formatter', () => {
  const payload = formatPayload(traits, true)
  assert.is(typeof payload, 'object')
  assert.is(payload.displayName, 'jim')
  // Convert strings
  assert.is(payload.color, undefined)
  assert.is(payload.color_str, 'blue')
  // Convert bools
  assert.is(payload.cool, undefined)
  assert.is(payload.cool_bool, false)
  // Convert integers
  assert.is(payload.count_int_int, undefined)
  assert.is(payload.count_int, 10)
  // Convert real
  assert.is(payload.lol, undefined)
  assert.is(payload.lol_real, 1.2)
  // camelCase
  assert.is(payload.test_snake_case, undefined)
  assert.is(payload.testSnakeCase_str, 'wow')
  // Convert array of strings
  assert.is(payload.weird_array_thing, undefined)
  assert.equal(payload.weirdArrayThing_strs, ['wow', 'rad', 'nice'])
  // Convert array of bools
  assert.is(payload.array_of_booleans, undefined)
  assert.equal(payload.arrayOfBooleans_bools, [true, false, true])
})

test('FullStory Event Payload Formatter', () => {
  const payload = formatPayload(traits)
  assert.is(typeof payload, 'object')
  assert.is(payload.displayName, undefined)
  assert.is(payload.displayName_str, 'jim')
})

test.run()
