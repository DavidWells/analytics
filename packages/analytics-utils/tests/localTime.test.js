import { test } from 'uvu'
import * as assert from 'uvu/assert'

const { localTime } = await import('../src/localTime.js')

/* The trailing 6 chars of the ISO string are the timezone offset e.g. "-09:30" */
function offsetFor(tz) {
  process.env.TZ = tz
  return localTime().slice(-6)
}

/* Correct reference offset for the current instant in the active TZ.
   Used for zones whose offset shifts with daylight saving, so the
   assertion stays valid whatever date the suite runs on. */
function correctOffset() {
  const tzo = -new Date().getTimezoneOffset()
  const sign = tzo >= 0 ? '+' : '-'
  const hours = Math.abs(Math.floor(Math.abs(tzo) / 60))
  const mins = Math.abs(Math.floor(tzo % 60))
  const p = (n) => (n < 10 ? '0' : '') + n
  return `${sign}${p(hours)}:${p(mins)}`
}

test('negative half hour zone UTC-09:30 (Marquesas) keeps the correct hour', () => {
  // Regression: pad(tzo / 60) floored -9.5 to -10 and emitted "-10:30"
  assert.is(offsetFor('Pacific/Marquesas'), '-09:30')
})

test('negative half hour zone Newfoundland stays off by zero', () => {
  process.env.TZ = 'America/St_Johns'
  assert.is(localTime().slice(-6), correctOffset())
})

test('positive half hour zone Kolkata +05:30 is unaffected', () => {
  assert.is(offsetFor('Asia/Kolkata'), '+05:30')
})

test('whole hour negative zone New York matches reference', () => {
  process.env.TZ = 'America/New_York'
  assert.is(localTime().slice(-6), correctOffset())
})

test('UTC yields +00:00', () => {
  assert.is(offsetFor('UTC'), '+00:00')
})

test.run()
