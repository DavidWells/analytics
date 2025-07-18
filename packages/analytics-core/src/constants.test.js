import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { ANON_ID, USER_ID, USER_TRAITS } from './constants.js'

test('ANON_ID constant is set', () => {
  assert.is(ANON_ID, '__anon_id')
})

test('USER_ID constant is set', () => {
  assert.is(USER_ID, '__user_id')
})

test('USER_TRAITS constant is set', () => {
  assert.is(USER_TRAITS, '__user_traits')
})

test.run()
