import test from 'ava'
import sinon from 'sinon'
import { isBrowser } from '@analytics/type-utils'
import mergeEndpointData from '../../../src/pinpoint/helpers/merge-endpoint-data'
import * as getClientInfo from '../../../src/utils/client-info'
import * as formatData from '../../../src/pinpoint/helpers/prepare-data'
import deepmerge from 'deepmerge'

let config
let getClientInfoStub
let deepMergeAllSpy

test.beforeEach(() => {
  config = {
    getContext: 'foo',
    getEndpointId: sinon.stub().resolves(),
    getUserId: sinon.stub(),
  }
  sinon.stub(formatData, 'prepareAttributes').resolves({
    DeviceMake: 'device make',
    DeviceModel: 'device model',
    DeviceType: 'device type',
  })
  sinon.stub(formatData, 'prepareMetrics').callsFake(() => {
    return { sessions: 'foo', pageViews: 'bar' }
  })
  getClientInfoStub = sinon.stub(getClientInfo, 'default').returns({
    device: {
      vendor: 'device vendor',
      model: 'device model',
      type: 'device type',
    },
    language: 'language',
    make: 'make',
    model: 'model',
    version: 'version',
    os: {
      name: 'os name',
      version: 'os version',
    },
  })
  deepMergeAllSpy = sinon.spy(deepmerge, 'all')
})

test.afterEach(() => {
  sinon.restore()
})

// Browser tests
test.skip('should get client info and set browser demographic info', async (t) => {
  // TODO stubbing import doesnt work need to fix to enable this test
  // sinon.replace(isBrowser, true)
  const endpoint = {}
  const data = await mergeEndpointData(endpoint, config)
  console.log('data', data)
  sinon.assert.calledOnce(getClientInfoStub)
  sinon.assert.calledOnce(deepMergeAllSpy)
  t.is(data.Demographic.Locale, 'language')
  t.is(data.Demographic.Make, 'make')
  t.is(data.Demographic.Model, 'model')
  t.is(data.Demographic.ModelVersion, 'version')
  t.is(data.Demographic.Platform, 'os name')
  t.is(data.Demographic.PlatformVersion, 'os version')
})

// Node tests
test('should set attributes to endpoint data', async (t) => {
  const endpoint = {}
  const data = await mergeEndpointData(endpoint, config)

  t.regex(
    JSON.stringify(data.Attributes.lastSessionDate[0]),
    /\b[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]+Z\b/
  )
  t.regex(
    JSON.stringify(data.Attributes.lastSession[0]),
    /\b\w+-\w+-\w+-\w+-\w+\b/
  )
})

test('should set default location to empty object', async (t) => {
  const endpoint = {}
  const data = await mergeEndpointData(endpoint, config)

  t.deepEqual(data.Location, {})
})

test('should set server demographic info', async (t) => {
  const endpoint = {}
  const data = await mergeEndpointData(endpoint, config)
  const { AppVersion, Make, Platform, PlatformVersion } = data.Demographic

  t.regex(JSON.stringify(AppVersion), /\d+.\d+.\d+/)
  t.is(Make, 'generic server')
  t.is(Platform, 'Node.js')
  t.regex(JSON.stringify(PlatformVersion), /v\d+\.\d+\.\d+/)
})

test('should set user id', async (t) => {
  config.getUserId.resolves('user id')
  const endpoint = {}
  const data = await mergeEndpointData(endpoint, config)

  t.deepEqual(data.User, { UserId: 'user id' })
})

test('should set metrics', async (t) => {
  const endpoint = {}
  const data = await mergeEndpointData(endpoint, config)

  t.deepEqual(data.Metrics, { sessions: 'foo', pageViews: 'bar' })
})

test('should merge endpoint data', async (t) => {
  const endpoint = { foo: 'foo', baz: 'baz', bar: 4 }
  const data = await mergeEndpointData(endpoint, config)

  t.is(data.foo, 'foo')
  t.is(data.baz, 'baz')
  t.is(data.bar, 4)
})
