import test from 'ava'
import { setItem, removeItem } from './storage'

test('setItem action creator', (t) => {
  const action = setItem('key', 'value', { location: 'cookie' })
  delete action.timestamp
  t.deepEqual(action, {
    key: 'key',
    options: { location: 'cookie' },
    type: 'setItemStart',
    value: 'value',
  })
})

test('removeItem action creator', (t) => {
  const action = removeItem('key')
  delete action.timestamp
  t.deepEqual(action, {
    key: 'key',
    options: undefined,
    type: 'removeItemStart'
  })
})
