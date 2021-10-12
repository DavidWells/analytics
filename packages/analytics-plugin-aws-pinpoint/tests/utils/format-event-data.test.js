import test from 'ava'
import formatEventData from '../../src/utils/format-event-data'

test('should return empty attributes and metrics if empty payload', (t) => {
  const payload = {}
  const data = formatEventData(payload)

  t.deepEqual(data.attributes, {})
  t.deepEqual(data.metrics, {})
})

test('should return attributes if payload contains string and boolean', (t) => {
  const payload = {
    foo: 'lol',
    bar: false,
    baz: 'jim',
  }
  const data = formatEventData(payload)

  t.deepEqual(data.attributes, {
    foo: 'lol',
    bar: false,
    baz: 'jim',
  })
  t.deepEqual(data.metrics, {})
})

test('should return metrics if payload contains number', (t) => {
  const payload = {
    foo: 43,
    bar: 10.3,
    baz: 0.343,
  }
  const data = formatEventData(payload)

  t.deepEqual(data.attributes, {})
  t.deepEqual(data.metrics, {
    foo: 43,
    bar: 10.3,
    baz: 0.343,
  })
})
