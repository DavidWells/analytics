
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { 
  delay,
} from '../src'

test.after(() => console.log('tests done'))

test('API is exposed', async () => {
  assert.is(typeof delay, 'function')
})

test.run()
