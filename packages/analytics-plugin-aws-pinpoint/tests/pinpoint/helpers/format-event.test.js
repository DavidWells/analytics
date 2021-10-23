import test from 'ava'
import sinon from 'sinon'
// import * as inBrowser from '../../../src/utils/in-browser'
import { isBrowser } from '@analytics/type-utils'
import * as prepareData from '../../../src/pinpoint/helpers/prepare-data'
import * as browserClientInfo from '../../../src/utils/client-info'
import formatEvent from '../../../src/pinpoint/helpers/format-event'

test.beforeEach(() => {
  sinon.spy(browserClientInfo, 'default')
  sinon
    .stub(prepareData, 'prepareAttributes')
    .resolves('prepareData.attributes')
  sinon.stub(prepareData, 'prepareMetrics').resolves('prepareData.metrics')
})

test.afterEach(() => {
  sinon.restore()
})

const config = {
  appTitle: 'test',
  appPackageName: 'foo',
  appVersionCode: '1.0',
  eventMapping: {},
  enrichEventAttributes: sinon.fake.resolves(),
  enrichEventMetrics: sinon.fake.resolves(),
  debug: false,
}

const data = {
  eventId: 'eventId',
}

// Browser only test
test.skip('should call getClientInfo', async () => {
  // TODO stubbing import doesnt work need to fix to enable this test
  // sinon.replace(inBrowser, 'default', true)
  // sinon.replace(types, 'isBrowser', true)
  const eventPayload = await formatEvent('test', data, config)

  sinon.assert.calledOnce(browserClientInfo.default)
})

// Node/browser tests
test('should not call getClientInfo', async () => {
  const eventPayload = await formatEvent('', data, config)

  sinon.assert.notCalled(browserClientInfo.default)
})

test('should set Session.Duration and Session.StopTimestamp if eventName equals Session_Stop', async (t) => {
  const eventPayload = await formatEvent('_session.stop', data, config)

  t.regex(JSON.stringify(eventPayload.eventId.Session.Duration), /\d/)
  t.regex(
    JSON.stringify(eventPayload.eventId.Session.StopTimestamp),
    /\b[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]+Z\b/
  )
})

test('should return valid eventPayload object', async (t) => {
  const eventPayload = await formatEvent('test', data, config)

  t.is(eventPayload.eventId.EventType, 'test')
  t.regex(
    JSON.stringify(eventPayload.eventId.Timestamp),
    /\b[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]+Z\b/
  )
  t.is(eventPayload.eventId.AppPackageName, 'foo')
  t.is(eventPayload.eventId.AppTitle, 'test')
  t.is(eventPayload.eventId.AppVersionCode, '1.0')
  t.is(eventPayload.eventId.Attributes, 'prepareData.attributes')
  t.is(eventPayload.eventId.Metrics, 'prepareData.metrics')
  t.regex(
    JSON.stringify(eventPayload.eventId.Session.Id),
    /\b\w+-\w+-\w+-\w+-\w+\b/
  )
  t.regex(
    JSON.stringify(eventPayload.eventId.Session.StartTimestamp),
    /\b[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]+Z\b/
  )
})
