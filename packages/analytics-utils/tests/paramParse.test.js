import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { paramsParse } from '../src/paramsParse'

function toPlainObject(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function _paramsParse(url) {
  return toPlainObject(paramsParse(url))
}

test('test simple params', () => {
  const url = 'http://localhost:3000/?hi=there&wow=lol'
  const parsed = _paramsParse(url)
  assert.equal(parsed, {
    hi: 'there',
    wow: 'lol',
  })
})

test('test boolean params', () => {
  const url = 'http://localhost:3000/?hi&no=false'
  const parsed = _paramsParse(url)
  assert.equal(parsed, {
    hi: true,
    no: 'false',
  })
})

test('Duplicate param keys', () => {
  const url = 'http://localhost:3000/?foo=&foo[]='
  const parsed = _paramsParse(url)
  assert.equal(parsed, {
    foo: [''],
  })
})

test('test utm params', () => {
  const url = 'http://localhost:3000/http://glocal.dev/?utm_source=the_source&utm_medium=camp%20med&utm_term=Bought%20keyword&utm_content=Funny%20Text&utm_campaign=400kpromo'
  const parsed = _paramsParse(url)
  assert.equal(parsed, {
    utm_campaign: '400kpromo',
    utm_content: 'Funny Text',
    utm_medium: 'camp med',
    utm_source: 'the_source',
    utm_term: 'Bought keyword',
  })
})

test('test deeply nested url values', () => {
  const url =
    'http://localhost:3000/?Target=Offer&Method=findAll&filters[has_goals_enabled][TRUE]=1&filters[status]=active&filters[otherthing]&filters[wow]arr[]=yaz&filters[wow]arr[]=naz&filters[wow]arr[]=[other]&fields[]=id&fields[]=name&fields[]=default_goal_name&yes'

  const parsed = _paramsParse(url)
  assert.equal(parsed, {
    Target: 'Offer',
    Method: 'findAll',
    fields: ['id', 'name', 'default_goal_name'],
    yes: true,
    filters: {
      has_goals_enabled: { TRUE: '1' },
      status: 'active',
      otherthing: true,
      wowarr: ['yaz', 'naz', '[other]'],
    },
  })
})

test.run()
