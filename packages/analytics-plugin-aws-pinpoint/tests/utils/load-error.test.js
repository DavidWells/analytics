import test from 'ava'
import loadError from '../../src/utils/load-error'

test('should throw pinpoint not loaded error when called', (t) => {
  const error = t.throws(
    () => {
      loadError()
    },
    { instanceOf: Error }
  )

  t.is(error.message, 'Pinpoint not loaded')
})
