import test from 'ava'
import dotProp from './dotProp'

const obj = {
  undef: undefined,
  zero: 0,
  one: 1,
  n: null,
  f: false,
  a: {
    two: 2,
    b: {
      three: 3,
      c: {
        four: 4
      }
    }
  }
}

test('dotPro values are correct', (t) => {
  t.deepEqual(dotProp(obj, 'zero'), 0)
  t.deepEqual(dotProp(obj, ''), undefined)
  t.deepEqual(dotProp(obj, 'one'), 1)
  t.deepEqual(dotProp(obj, 'one.two'), undefined)
  t.deepEqual(dotProp(obj, 'a'), obj.a)
  t.deepEqual(dotProp(obj, 'a.two'), obj.a.two)
  t.deepEqual(dotProp(obj, 'a.b'), obj.a.b)
  t.deepEqual(dotProp(obj, 'a.b.three'), obj.a.b.three)
  t.deepEqual(dotProp(obj, 'a.b.c'), obj.a.b.c)
  t.deepEqual(dotProp(obj, 'a.b.c.four'), obj.a.b.c.four)
  t.deepEqual(dotProp(obj, 'n'), obj.n)
  t.deepEqual(dotProp(obj, 'n.badkey'), undefined)
  t.deepEqual(dotProp(obj, 'f'), false)
  t.deepEqual(dotProp(obj, 'f.badkey'), undefined)
})

test('dotProp values with default are correct', (t) => {
  t.deepEqual(dotProp(obj, '', 'foo'), 'foo')
  t.deepEqual(dotProp(obj, 'undef', 'foo'), 'foo')
  t.deepEqual(dotProp(obj, 'n', 'foo'), null)
  t.deepEqual(dotProp(obj, 'n.badkey', 'foo'), 'foo')
  t.deepEqual(dotProp(obj, 'zero', 'foo'), 0)
  t.deepEqual(dotProp(obj, 'a.badkey', 'foo'), 'foo')
  t.deepEqual(dotProp(obj, 'a.badkey.anotherbadkey', 'foo'), 'foo')
  t.deepEqual(dotProp(obj, 'f', 'foo'), false)
  t.deepEqual(dotProp(obj, 'f.badkey', 'foo'), 'foo')
})

test('throws on undefined', t => {
  const error = t.throws(() => {
    dotProp(obj, undefined)
  }, TypeError)

  t.is(error.message, 'Cannot read property \'split\' of undefined')

  const errorTwo = t.throws(() => {
    dotProp(obj, undefined, 'foo')
  }, TypeError)
  t.is(errorTwo.message, 'Cannot read property \'split\' of undefined')
})
