import '../_setup.js'
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import isPromise from '../_utils/isPromise.js'
import Analytics from '../../src/index.js'

test('storage.setItem returns a promise', () => {
  const analytics = Analytics({
    app: 'appname',
    version: 100
  })

  const promise = analytics.storage.setItem('storage_key', 'storage_value')
  assert.is(isPromise(promise), true)
})

test('storage.removeItem returns a promise', () => {
  const analytics = Analytics({
    app: 'appname',
    version: 100
  })

  const promise = analytics.storage.removeItem('storage_key')
  assert.is(isPromise(promise), true)
})

test('awaiting storage.setItem allows immediate reads', async () => {
  const analytics = Analytics({
    app: 'appname',
    version: 100
  })

  await analytics.storage.setItem('storage_key', 'storage_value')

  const value = analytics.storage.getItem('storage_key')
  assert.is(value, 'storage_value')
})

test('awaiting storage.removeItem removes value', async () => {
  const analytics = Analytics({
    app: 'appname',
    version: 100
  })

  await analytics.storage.setItem('storage_key', 'storage_value')
  await analytics.storage.removeItem('storage_key')

  const value = analytics.storage.getItem('storage_key')
  assert.is(value, undefined)
})

test.run()
