import test from 'ava'
import sinon from 'sinon'
import * as inBrowser from '../../../src/utils/in-browser'
import mergeEndpointData from '../../../src/pinpoint/helpers/merge-endpoint-data'
import * as getClientInfo from '../../../src/utils/client-info'
import * as formatEvent from '../../../src/pinpoint/helpers/format-event'
import deepmerge from 'deepmerge'

let config
let prepareAttributesStub
let prepareMetricsStub
let getClientInfoStub
let deepMergeAllStub

test.beforeEach(() => {
  config = {
    getContext: 'foo',
    getEndpointId: sinon.stub().resolves(),
    getUserId: sinon.stub(),
  }
  prepareAttributesStub = sinon
    .stub(formatEvent, 'prepareAttributes')
    .resolves({
      lastSessionDate: 'lastSessionDate',
      lastSession: false,
      lastPageSession: false,
    })
  prepareMetricsStub = sinon
    .stub(formatEvent, 'prepareMetrics')
    .callsFake(() => {
      return { sessions: 'foo', pageViews: 'bar' }
    })
  getClientInfoStub = sinon.stub(getClientInfo, 'default').returns({
    device: {
      vendor: 'vendor',
      model: 'device model',
      type: 'type',
    },
    language: 'language',
    make: 'make',
    model: 'model',
    version: 'version',
    platform: 'platform',
    os: {
      name: 'os name',
      version: 'os version',
    },
  })
  deepMergeAllStub = sinon.stub(deepmerge, 'all').returns({
    User: {
      UserId: 'user id',
      UserAttributes: {
        userAttr1: 'userAttr1',
        userAttr2: 'userAttr2',
      },
    },
  })
})

test.afterEach(() => {
  sinon.restore()
})

// // Browser tests
test('should get client info', async () => {
  sinon.replace(inBrowser, 'default', true)
  const endpoint = {}
  const data = await mergeEndpointData(endpoint, config)
  sinon.assert.calledOnce(getClientInfoStub)
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
  t.regex(JSON.stringify(data.Demographic.AppVersion), /\d+.\d+.\d+/)
  t.is(data.Demographic.Make, 'generic server')
  t.is(data.Demographic.Platform, 'Node.js')
  t.regex(JSON.stringify(data.Demographic.PlatformVersion), /v\d+\.\d+\.\d+/)
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

test('should add endpoint info to endpoint data', async (t) => {
  const endpoint = { foo: 'foo', baz: 'baz' }
  const data = await mergeEndpointData(endpoint, config)
  t.is(data.foo, 'foo')
  t.is(data.baz, 'baz')
})
