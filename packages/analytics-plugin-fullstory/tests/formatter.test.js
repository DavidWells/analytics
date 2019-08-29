import test from 'ava'
import { formatPayload } from '../src/browser'

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

test('FullStory Traits Formatter', (t) => {
  const payload = formatPayload(traits, true)
  t.is(typeof payload, 'object')
  t.is(payload.displayName, 'jim')
  // Convert strings
  t.is(payload.color, undefined)
  t.is(payload.color_str, 'blue')
  // Convert bools
  t.is(payload.cool, undefined)
  t.is(payload.cool_bool, false)
  // Convert integers
  t.is(payload.count_int_int, undefined)
  t.is(payload.count_int, 10)
  // Convert real
  t.is(payload.lol, undefined)
  t.is(payload.lol_real, 1.2)
  // camelCase
  t.is(payload.test_snake_case, undefined)
  t.is(payload.testSnakeCase_str, 'wow')
  // Convert array of strings
  t.is(payload.weird_array_thing, undefined)
  t.deepEqual(payload.weirdArrayThing_strs, ['wow', 'rad', 'nice'])
  // Convert array of bools
  t.is(payload.array_of_booleans, undefined)
  t.deepEqual(payload.arrayOfBooleans_bools, [true, false, true])
})

test('FullStory Event Payload Formatter', (t) => {
  const payload = formatPayload(traits)
  t.is(typeof payload, 'object')
  t.is(payload.displayName, undefined)
  t.is(payload.displayName_str, 'jim')
})
