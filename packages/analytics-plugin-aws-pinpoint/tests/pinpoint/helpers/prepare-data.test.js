import test from 'ava'
import * as prepareData from '../../../src/pinpoint/helpers/prepare-data'

// Prepare attributes tests
test('should return empty object if attributes are empty', async (t) => {
  const sanitized = await prepareData.prepareAttributes({})

  t.deepEqual(sanitized, {})
})

test('should sanitize attributes', async (t) => {
  const sanitized = await prepareData.prepareAttributes({
    foo: 'foo',
    bar: 'bar',
  })

  t.deepEqual(sanitized, {
    foo: 'foo',
    bar: 'bar',
  })
})

test('should remove undefined or null attributes', async (t) => {
  const sanitized = await prepareData.prepareAttributes({
    foo: undefined,
    bar: 'bar',
    baz: null,
  })

  t.deepEqual(sanitized, {
    bar: 'bar',
  })
})

test('should return an array of string for each property if asArray set to true', async (t) => {
  const sanitized = await prepareData.prepareAttributes(
    { foo: 'foo', bar: 'bar' },
    true
  )

  t.deepEqual(sanitized, {
    foo: ['foo'],
    bar: ['bar'],
  })
})

// Prepare metrics tests
test('should return empty object if metrics are empty', async (t) => {
  const sanitized = await prepareData.prepareMetrics({})
  t.deepEqual(sanitized, {})
})

test('should sanitize metrics', async (t) => {
  const sanitized = await prepareData.prepareMetrics({
    foo: 3,
    bar: 34.3,
  })

  t.deepEqual(sanitized, {
    foo: 3,
    bar: 34.3,
  })
})

test('should set NaN for undefined or string metrics', async (t) => {
  const sanitized = await prepareData.prepareMetrics({
    foo: undefined,
    bar: 'bar',
  })

  t.deepEqual(sanitized, {
    foo: NaN,
    bar: NaN,
  })
})

test('should set 0 for null metrics', async (t) => {
  const sanitized = await prepareData.prepareMetrics({
    foo: null,
    bar: null,
  })

  t.deepEqual(sanitized, {
    foo: 0,
    bar: 0,
  })
})
