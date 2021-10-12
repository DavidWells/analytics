import test from 'ava'
import sinon from 'sinon'
import * as inBrowser from '../../../src/utils/in-browser'
import * as fe from '../../../src/pinpoint/helpers/format-event'

let prepareAttributesStub
let prepareMetricsStub
let testStub

test.beforeEach(() => {
  console.log(call)
  call++
  prepareMetricsStub = sinon
    .stub(fe, 'prepareMetrics')
  testStub = sinon.replace(fe, 'test', () => {return '24354654535'})
  // testStub = sinon.stub(fe, 'test').callsFake(() => { return '3435354353'})
})

test.afterEach(() => {
  sinon.restore()
})

const config = {
  appTitle: 'test',
  appPackageName: 'foo',
  appVersionCode: '1.0',
  eventMapping: {},
  enrichEventAttributes: sinon.fake.resolves({
    attr1: 'attr1',
    attr2: 'attr2',
  }),
  enrichEventMetrics: sinon.fake.resolves({
    met1: 3,
    met2: 34.3,
  }),
  debug: false,
}

const data = {
  eventId: 'eventId',
}

// Browser test
test('should set pageSession', async (t) => {
  sinon.replace(inBrowser, 'default', true)
  const eventPayload = await fe.formatEvent('test', data, config)
  console.log(eventPayload, '********* eventPayload Browser ******')
})

// Node test
test.skip('should not contain app title', async (t) => {
  const eventPayload = await fe.formatEvent('test', data, config)

  t.is(eventPayload.eventId.EventType, 'test')
  t.regex(
    JSON.stringify(eventPayload.eventId.Timestamp),
    /\b[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]+Z\b/
  )
  t.is(eventPayload.eventId.AppPackageName, 'foo')
  t.is(eventPayload.eventId.AppTitle, 'test')
  t.is(eventPayload.eventId.AppVersionCode, '1.0')
  t.is(eventPayload.eventId.Attributes.attr1, 'attr1')
  t.is(eventPayload.eventId.Attributes.attr2, 'attr2')
  t.regex(
    JSON.stringify(eventPayload.eventId.Attributes.date),
    /\b[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]+Z\b/
  )
  t.regex(
    JSON.stringify(eventPayload.eventId.Attributes.sessionId),
    /\b\w+-\w+-\w+-\w+-\w+\b/
  )
  // TODO: sessionTime
  t.regex(JSON.stringify(eventPayload.eventId.Metrics.hour), /^\d{1,2}$/)
  t.regex(JSON.stringify(eventPayload.eventId.Metrics.day), /^\d{1,2}$/)
  t.regex(JSON.stringify(eventPayload.eventId.Metrics.month), /^\d{1,2}$/)
  t.regex(JSON.stringify(eventPayload.eventId.Metrics.year), /^\d{4}$/)
  t.is(eventPayload.eventId.Metrics.met1, 3)
  t.is(eventPayload.eventId.Metrics.met2, 34.3)
  t.regex(
    JSON.stringify(eventPayload.eventId.Session.Id),
    /\b\w+-\w+-\w+-\w+-\w+\b/
  )
  t.regex(
    JSON.stringify(eventPayload.eventId.Session.StartTimestamp),
    /\b[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]+Z\b/
  )
})

// {
//      '3': {
//        EventType: 'foo',
//        Timestamp: '2021-10-11T19:57:17.322Z',
//        AppPackageName: 'foo',
//        AppTitle: undefined,
//        AppVersionCode: '1.0',
//        Attributes: {
//          date: '2021-10-11T19:57:17.322Z',
//          sessionId: 'ec648463-81e4-4190-8c54-d853fb5ff73d'
//        },
//        Metrics: { sessionTime: 0, hour: 15, day: 2, month: 10, year: 2021 },
//        Session: {
//          Id: 'ec648463-81e4-4190-8c54-d853fb5ff73d',
//          StartTimestamp: '2021-10-11T19:57:17.322Z'
//        }
//      }
//    }
