import test from 'ava'
import sinon from 'sinon'
import * as inBrowser from '../../../src/utils/in-browser'
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
test('should call getClientInfo', async () => {
  sinon.replace(inBrowser, 'default', true)
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
  const {
    eventId: {
      EventType,
      Timestamp,
      AppPackageName,
      AppTitle,
      AppVersionCode,
      Attributes,
      Metrics,
      Session: {
        Id,
        StartTimestamp
      }
    }
   } = await formatEvent('test', data, config)

  t.is(EventType, 'test')
  t.regex(
    JSON.stringify(Timestamp),
    /\b[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]+Z\b/
  )
  t.is(AppPackageName, 'foo')
  t.is(AppTitle, 'test')
  t.is(AppVersionCode, '1.0')
  t.is(Attributes, 'prepareData.attributes')
  t.is(Metrics, 'prepareData.metrics')
  t.regex(
    JSON.stringify(Id),
    /\b\w+-\w+-\w+-\w+-\w+\b/
  )
  t.regex(
    JSON.stringify(StartTimestamp),
    /\b[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]+Z\b/
  )
})
