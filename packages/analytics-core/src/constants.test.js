import test from 'ava'
import { ANON_ID, USER_ID, USER_TRAITS } from './constants'

test('ANON_ID constant is set', (t) => {
  t.is(ANON_ID, '__anon_id')
})

test('USER_ID constant is set', (t) => {
  t.is(USER_ID, '__user_id')
})

test('USER_TRAITS constant is set', (t) => {
  t.is(USER_TRAITS, '__user_traits')
})
