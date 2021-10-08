import test from 'ava'
import sinon from 'sinon'
import mergeEndpointData from '../../../src/pinpoint/helpers/merge-endpoint-data'
import * as formatEvent from '../../../src/pinpoint/helpers/format-event'
import sessionUtils from '@analytics/session-utils'

let sandbox
let config
let prepareAttributes
let prepareMetrics

test.beforeEach(() => {
  sandbox = sinon.createSandbox()
  config = {
    getContext: 'foo',
    getEndpointId: sandbox.stub().resolves(),
    getUserId: sandbox.stub(),
  }
  prepareAttributes = sandbox.stub(formatEvent, 'prepareAttributes').resolves({
    lastSessionDate: 'lastSessionDate',
    lastSession: false,
    lastPageSession: false,
  })
  prepareMetrics = sandbox.stub(formatEvent, 'prepareMetrics').callsFake(() => {
    return { sessions: 'foo', pageViews: 'bar' }
  })
})

test.afterEach(() => {
  sandbox.restore()
})

test('should set attributes to endpoint data', async (t) => {
  const endpoint = {}
  const data = await mergeEndpointData(endpoint, config)
  console.log(data.Attributes, '******** ATTRIBUTES ********')
  
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
