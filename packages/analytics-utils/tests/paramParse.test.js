import test from 'ava'
import {parseParam} from '../dist/paramsParse'

test('test simple params', t => {
  const url = 'http://localhost:3000/?hi=there&wow=lol'
  const parsed = parseParam(url)
  t.deepEqual(parsed, {
    hi: 'there',
    wow: 'lol',
  })
})

test('test boolean params', t => {
  const url = 'http://localhost:3000/?hi&no=false'
  const parsed = parseParam(url)
  t.deepEqual(parsed, {
    hi: true,
    no: 'false',
  })
})

test('test utm params', t => {
  const url = 'http://localhost:3000/http://glocal.dev/?utm_source=the_source&utm_medium=camp%20med&utm_term=Bought%20keyword&utm_content=Funny%20Text&utm_campaign=400kpromo'
  const parsed = parseParam(url)
  t.deepEqual(parsed, {
    utm_campaign: '400kpromo',
    utm_content: 'Funny Text',
    utm_medium: 'camp med',
    utm_source: 'the_source',
    utm_term: 'Bought keyword',
  })
})

test('test deeply nested url values', t => {
  const url =
    'http://localhost:3000/?Target=Offer&Method=findAll&filters[has_goals_enabled][TRUE]=1&filters[status]=active&filters[otherthing]&filters[wow]arr[]=yaz&filters[wow]arr[]=naz&filters[wow]arr[]=[other]&fields[]=id&fields[]=name&fields[]=default_goal_name&yes'

  const parsed = parseParam(url)
  t.deepEqual(parsed, {
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
