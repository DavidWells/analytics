import test from 'ava'
import { formatEvent } from '../../../src/pinpoint/helpers/format-event'

const config = { 
  appTitle: 'test',
  appPackageName: 'foo',
  appVersionCode: '1.0',
  eventMapping: {}
}

const data = {
  eventId: '3'
}

const eventName = 'foo'

test('should not contain app title', async (t) => {
  const config = { 
    appPackageName: 'foo',
    appVersionCode: '1.0',
    eventMapping: {}
  }

  const data = {
    eventId: '3'
  }

  const eventPayload = await formatEvent(eventName, data, config)
  t.notRegex(JSON.stringify(eventPayload), /AppTitle/)
  console.log(eventPayload, '******** eventPayload *********')
  t.pass()
})
