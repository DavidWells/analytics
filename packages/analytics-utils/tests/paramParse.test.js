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

test('Handles null broken uri', () => {
  const url = 'http://localhost:3000/?a=1&foo=cool&%%20Exe'
  const parsed = _paramsParse(url)
  // console.log('parsed', parsed)
  assert.equal(parsed, {
    a: '1',
    foo: 'cool',
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

test('Big url', () => {
  const url =
    'http://localhost:3000/?Target=Report&Method=getStats&fields%5B%5D=Offer.name&fields%5B%5D=Advertiser.company&fields%5B%5D=Stat.clicks&fields%5B%5D=Stat.conversions&fields%5B%5D=Stat.cpa&fields%5B%5D=Stat.payout&fields%5B%5D=Stat.date&fields%5B%5D=Stat.offer_id&fields%5B%5D=Affiliate.company&groups%5B%5D=Stat.offer_id&groups%5B%5D=Stat.date&filters%5BStat.affiliate_id%5D%5Bconditional%5D=EQUAL_TO&filters%5BStat.affiliate_id%5D%5Bvalues%5D=1831&limit=9999'

  const decoded = 'http://localhost:3000/?Target=Report&Method=getStats&fields[]=Offer.name&fields[]=Advertiser.company&fields[]=Stat.clicks&fields[]=Stat.conversions&fields[]=Stat.cpa&fields[]=Stat.payout&fields[]=Stat.date&fields[]=Stat.offer_id&fields[]=Affiliate.company&groups[]=Stat.offer_id&groups[]=Stat.date&filters[Stat.affiliate_id][conditional]=EQUAL_TO&filters[Stat.affiliate_id][values]=1831&limit=9999'

  const parsed = _paramsParse(url)
  const parsedTwo = _paramsParse(decoded)
  const answer = {
    Target: 'Report',
    Method: 'getStats',
    fields: [
      'Offer.name',
      'Advertiser.company',
      'Stat.clicks',
      'Stat.conversions',
      'Stat.cpa',
      'Stat.payout',
      'Stat.date',
      'Stat.offer_id',
      'Affiliate.company'
    ],
    groups: [ 'Stat.offer_id', 'Stat.date' ],
    limit: '9999',
    filters: { 'Stat.affiliate_id': { conditional: 'EQUAL_TO', values: '1831' } }
  }

  assert.equal(parsed, answer)
  assert.equal(parsedTwo, answer)
})

// https://random.url.com?Target=Offer&Method=findAll&filters%5Bhas_goals_enabled%5D%5BTRUE%5D=1&filters%5Bstatus%5D=active&fields%5B%5D=id&fields%5B%5D=name&fields%5B%5D=default_goal_name
// http://localhost:3000/?Target=Offer&Method=findAll&filters[has_goals_enabled][TRUE]=1&filters[status]=active&filters[wow]arr[]=yaz&filters[wow]arr[]=naz&fields[]=id&fields[]=name&fields[]=default_goal_name

test.run()
