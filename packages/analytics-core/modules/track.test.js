// src/actions.test.js
import test from 'ava';
import { trackEvent, EVENTS } from './track';

let lol = 'hi'
test.before(t => {
	// This runs before all tests
	lol = 'what'
});

test('trackEvent action', t => {
  console.log('lol', lol)
  t.deepEqual(trackEvent({
    eventName: 'lol',
    whateverBro: true
  }), {
    type: EVENTS.TRACK_EVENT,
    data: {
      eventName: 'lol',
      whateverBro: true
    }
  });
});
