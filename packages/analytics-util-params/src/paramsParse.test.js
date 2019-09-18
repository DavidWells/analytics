import test from 'ava'
import paramsParse from './paramsParse'

function format(niceStr) {
  return niceStr.split('\n').map((x) => x.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/g, '').trim()).join('')
}

test('lib', t => {
  t.is(typeof paramsParse, 'function', 'exports a function')
})

test('(decode) simple []', t => {
  let str = '?foo=foo&bar[]=bar1&bar[]=bar2'
  let out = paramsParse(str)
  console.log('out', out)
  t.deepEqual(out, { foo: 'foo', bar: ['bar1', 'bar2'] }, '~> is expected value')
})

test('parses a simple string', (t) => {
  t.deepEqual(paramsParse('?0=foo'), { 0: 'foo' })
  t.deepEqual(paramsParse('?foo=c++'), { foo: 'c  ' })
  t.deepEqual(paramsParse('?foo'), { foo: true })
  t.deepEqual(paramsParse('?foo='), { foo: null })
  t.deepEqual(paramsParse('?foo=bar'), { foo: 'bar' })
  t.deepEqual(paramsParse('?foo&bar=foo'), { foo: true, bar: 'foo' })
  t.deepEqual(paramsParse('? foo = bar = baz '), { ' foo ': ' bar = baz ' })

  t.deepEqual(paramsParse('?foo=bar&bar=baz'), { foo: 'bar', bar: 'baz' })
  t.deepEqual(paramsParse('?foo2=bar2&baz2='), { foo2: 'bar2', baz2: null })
  t.deepEqual(paramsParse('?foo=bar&baz'), { foo: 'bar', baz: true })
  t.deepEqual(paramsParse('?cht=p3&chd=t:60,40&chs=250x100&chl=Hello|World'), {
    cht: 'p3',
    chd: 't:60,40',
    chs: '250x100',
    chl: 'Hello|World'
  })
  // These cases are not handled
  // t.deepEqual(paramsParse('?a[>=]=23'), { a: { '>=': '23' } })
  // t.deepEqual(paramsParse('?a[<=>]==23'), { a: { '<=>': '=23' } })
  // t.deepEqual(paramsParse('?a[==]=23'), { a: { '==': '23' } })
  // t.deepEqual(paramsParse('?foo=bar=baz'), { foo: 'bar=baz' })
})

test('(decode) simple', t => {
  let str = '?foo=foo&bar=bar1&bar=bar2'
  let out = paramsParse(str)
  t.deepEqual(out, { foo: 'foo', bar: 'bar1' }, '~> is expected value')
})

test('(decode) numbers', t => {
  let str = '?foo=1'
  let out = paramsParse(str)
  t.deepEqual(out, { foo: 1 }, '~> is expected value')
})

test('(decode) floats', t => {
  let str = '?foo=1&bar=1.3&baz=19.111'
  let out = paramsParse(str)
  t.deepEqual(out, { foo: 1, bar: 1.3, baz: 19.111 })
})

test('(decode) booleans', t => {
  let str = '?foo=true&bar=false'
  let out = paramsParse(str)
  t.deepEqual(out, { foo: true, bar: false })
})

test('(decode) empty', t => {
  let str1 = '?foo=&bar='
  let out1 = paramsParse(str1)
  t.deepEqual(out1, { foo: null, bar: null })

  let str2 = '?foo&bar'
  let out2 = paramsParse(str2)
  t.deepEqual(out2, { foo: true, bar: true })
})

test('does not overide prototypes', t => {
  let obj = paramsParse('?toString&__proto__=lol')
  console.log('obj', obj)
  // let obj = { hi: 'hi'}
  t.is(typeof obj, 'object')
  t.is(typeof obj.toString, 'function')
  t.not(obj.__proto__, 'lol') // eslint-disable-line

  let objTwo = paramsParse('?toString=lol&__proto__=lol')
  console.log('obj', obj)
  // let obj = { hi: 'hi'}
  t.is(typeof objTwo, 'object')
  t.is(typeof objTwo.toString, 'function')
  t.not(obj.__proto__, 'lol') // eslint-disable-line
})

// https://github.com/sindresorhus/query-string/blob/master/test/parse.js#L74
test('decodes plus signs', t => {
  const obj = paramsParse('?foo+bar=baz+qux')
  // let obj = { hi: 'hi'}
  t.is(typeof obj, 'object')
  t.deepEqual(obj, {
    'foo bar': 'baz qux',
  })

  const objTwo = paramsParse('?foo+bar=baz%2Bqux')

  t.is(typeof objTwo, 'object')
  t.deepEqual(objTwo, {
    'foo bar': 'baz+qux',
  })
})

test('decode keys and values', t => {
  t.deepEqual(paramsParse('?st%C3%A5le=foo'), { ståle: 'foo' })
  /* Requires https://github.com/SamVerschueren/decode-uri-component/blob/master/index.js */
  // t.deepEqual(paramsParse('?foo=%7B%ab%%7C%de%%7D+%%7Bst%C3%A5le%7D%'), {foo: '{%ab%|%de%} %{ståle}%'});
})

test('handles strings with query string that contain =', t => {
  t.deepEqual(paramsParse('https://foo.bar?foo[]=baz=bar&foo[]=baz#top'), {
    foo: ['baz=bar', 'baz']
  })
  t.deepEqual(paramsParse('https://foo.bar?foo[]=bar=&foo[]=baz='), {
    foo: ['bar=', 'baz=']
  })
})

test('does not throw on invalid input & does not include invalid output', t => {
  const obj = paramsParse('?%&')
  // let obj = { hi: 'hi'}
  t.is(typeof obj, 'object')
  t.deepEqual(obj, {})
  t.is(Object.keys(obj).length, 0)
})

test('Parse utm params', (t) => {
  const url = `http://site.com/
  ?utm_source=the_source
  &utm_medium=camp med
  &utm_term=Bought keyword
  &utm_content=Funny Text
  &utm_campaign=400kpromo`
  const encodedUrl = encodeURI(format(url))
  const obj = paramsParse(encodedUrl)
  t.is(typeof obj, 'object')
  t.is(obj.utm_source, 'the_source')
  t.is(obj.utm_medium, 'camp med')
  t.is(obj.utm_term, 'Bought keyword')
  t.is(obj.utm_content, 'Funny Text')
  t.is(obj.utm_campaign, '400kpromo')
})

test('Parse other complex params', (t) => {
  const url = `https://random.url.com
  ?Target=Offer
  &Method=findAll
  &filters[has_setting_off]=false
  &filters[has_goals_enabled][TRUE]=1
  &filters[status]=active
  &fields[]=id
  &fields[]=name
  &fields[]=default_goal_name
  `
  const encodedUrl = encodeURI(format(url))
  const obj = paramsParse(encodedUrl)
  t.is(typeof obj, 'object')
  t.deepEqual(obj, {
    Target: 'Offer',
    Method: 'findAll',
    fields: ['id', 'name', 'default_goal_name'],
    filters: {
      has_setting_off: false,
      has_goals_enabled: {
        TRUE: 1
      },
      status: 'active'
    }
  })
})

/*
test('open api', t => {
  const url = `https://random.url.com
  ?what[hello][wow][cool]=true
  &q[hello]=world
  &q[snarg][1][value]=blerg
  &q[snarg][2][value]=blah
  &q[foo][][value][la]=foo
  &q[foo][][value][la]=baz
  &q[foo][][boom][fizz]=leet
  &q[foo][][boom][cool][a]=rad
  &q[foo][][boom][cool][b]=tworad
  &q[foo][][awesome][z][w]=123
  &q[snarg][3][value]=zoo
  &q[snarg][4][lit]=yyy
  &q[bar][0]=1
  &q[bar][1]=2
  &q[bar][2]=3
  &q[fizz][value][]=xxx
  &q[fizz][value][]=yyy
  &q[fancy][pants][0]=a
  &q[fancy][pants][1]=b
  &q[fancy][pants][2]=c
  &q[tricky][shoes][]=x
  &q[tricky][shoes][]=y
  &q[tricky][shoes][]=z
  &filters[Stat.affiliate_id][conditional]=EQUAL_TO
  &filters[Stat.affiliate_id][values][]=44
  &filters[Stat.affiliate_id][values][]=55
  &filters[cook][values][]=55
  &cool[]=word
  &cool[]=son
  &utm=hi
  `
  /*
  &q[bar][0]=1
  &q[bar][1]=2
  &q[bar][2]=3
  &q[foo][value]=xxx
  &q[foo][value]=yyy
  &q[fancy][pants][0]=x
  &q[fancy][pants][1]=y
  &q[fancy][pants][2]=z
  &q[tricky][shoes][]=x
  &q[tricky][shoes][]=y
  &q[tricky][shoes][]=z
  &filters[Stat.affiliate_id][values][]=44
  &filters[Stat.affiliate_id][values][]=55
   */
/*
  const encodedUrl = encodeURI(format(url))
  console.log('encoded url', encodedUrl)
  const obj = paramsParse(encodedUrl)
  deepLog(obj)
  t.deepEqual(obj, {
    utm: 'hi',
    q: {
      bar: [1, 2, 3],
      fizz: {
        value: ['xxx', 'yyy']
      },
      fancy: {
        pants: ['a', 'b', 'c']
      },
      tricky: {
        shoes: ['x', 'y', 'z']
      },
      hello: 'world',
      snarg:
      [ { value: 'blerg' },
        { value: 'blah' },
        { value: 'zoo' },
        { lit: 'yyy' } ],
      foo: [{
        value: {
          la: ['foo', 'baz']
        },
        boom: {
          fizz: 'leet',
          cool: {
            a: 'rad',
            b: 'tworad'
          }
        },
        awesome: {
          z: {
            w: 123
          }
        }
      }]
    },
    filters: {
      'Stat.affiliate_id': {
        values: [44, 55],
        conditional: 'EQUAL_TO'
      },
      cook: {
        values: [55]
      }
    },
    cool: ['word', 'son'],
    what: {
      hello: {
        wow: {
          cool: true
        }
      }
    }
  })
})

test('Object in array', (t) => {
  const url = `https://random.url.com
  ?groups[]=Stat.offer_id
  &groups[]=Stat.date
  &groups[][test]=objectinarray
  &groups[][arb]=thing
  &groups[][wow][]=x
  &groups[][wow][]=y
  `
  const encodedUrl = encodeURI(format(url))
  console.log('encoded url', encodedUrl)
  const obj = paramsParse(encodedUrl)
  deepLog(obj)
  t.is(typeof obj, 'object')
  t.deepEqual(obj, {
    groups: [
      'Stat.offer_id',
      'Stat.date',
      { test: 'objectinarray' },
      { arb: 'thing' },
      { wow: ['x', 'y'] }
    ],
  })
})

test('Object with nested array of objects', (t) => {
  const url = `https://random.url.com
  ?Target=Report
  &q[snarg][1][value]=blerg
  &q[snarg][2][value]=blah
  &groups[]=Stat.offer_id
  &groups[]=Stat.date
  &groups[][test]=objectinarray
`
  const encodedUrl = encodeURI(format(url))
  console.log('encoded url', encodedUrl)
  const obj = paramsParse(encodedUrl)
  t.is(typeof obj, 'object')
  t.deepEqual(obj, {
    Target: 'Report',
    q: {
      snarg: [
        { value: 'blerg' },
        { value: 'blah' }
      ]
    },
    groups: [ 'Stat.offer_id', 'Stat.date', { test: 'objectinarray' } ]
  })
})

test('Parse complex params', (t) => {
  const url = `https://random.url.com
  ?Target=Report
  &boolean=false
  &q[snarg][1][value]=blerg
  &q[snarg][2][value]=blah
  &yolo[category][in]=development,design
  &utm_source=the_source
  &utm_medium=camp med
  &utm_term=Bought keyword
  &utm_content=Funny Text
  &utm_campaign=400kpromo
  &booleanTwo=true
  &Method=getStats
  &limit=9999
  &person[address][city]=London
  &person[address][street]=12+High+Street
  &q[bar][0]=1
  &q[bar][1]=2
  &q[bar][2]=3
  &fields[]=Offer.name
  &fields[]=Advertiser.company
  &fields[]=Stat.clicks
  &fields[]=Stat.conversions
  &fields[]=Stat.cpa
  &fields[]=Stat.payout
  &fields[]=Stat.date
  &fields[]=Stat.offer_id
  &fields[]=Affiliate.company
  &groups[]=Stat.offer_id
  &groups[]=Stat.date
  &groups[][test]=objectinarray
  &filters[Stat.affiliate_id][conditional]=EQUAL_TO
  &filters[Stat.affiliate_id][value]=44
  &filters[Stat.affiliate_id][values][]=44
  &filters[Stat.affiliate_id][values][]=55
  &filters[ben][her][was][good]=movie
  &filters[neato][values]=1831
  &filters[neato][wow]=lol
  &filters[birth-date][qte]=1970-01-01
  &json={"what":{"hello":{"wow":{"cool":true}}}}
  &eJson=%7B%22what%22%3A%7B%22hello%22%3A%7B%22wow%22%3A%7B%22cool%22%3Atrue%7D%7D%7D%7D
  &brokenjson={"what":{"hello":{"wow":{"coox:true}}}}
  `
  const encodedUrl = format(url)
  console.log('encoded url', encodedUrl)
  const obj = paramsParse(encodedUrl)
  t.is(typeof obj, 'object')

  t.deepEqual(obj, {
    Target: 'Report',
    boolean: false,
    q: {
      bar: [ 1, 2, 3 ],
      snarg: [
        { value: 'blerg' },
        { value: 'blah' }
      ]
    },
    utm_source: 'the_source',
    utm_medium: 'camp med',
    utm_term: 'Bought keyword',
    utm_content: 'Funny Text',
    utm_campaign: '400kpromo',
    booleanTwo: true,
    Method: 'getStats',
    limit: 9999,
    fields: ['Offer.name',
      'Advertiser.company',
      'Stat.clicks',
      'Stat.conversions',
      'Stat.cpa',
      'Stat.payout',
      'Stat.date',
      'Stat.offer_id',
      'Affiliate.company'
    ],
    groups: [
      'Stat.offer_id',
      'Stat.date',
      { test: 'objectinarray' }
    ],
    yolo: {
      category: {
        in: 'development,design'
      }
    },
    person: {
      address: {
        city: 'London',
        street: '12 High Street'
      }
    },
    filters: {
      'Stat.affiliate_id': {
        conditional: 'EQUAL_TO',
        value: 44,
        values: [44, 55]
      },
      ben: {
        her: {
          was: {
            good: 'movie'
          }
        }
      },
      neato: {
        values: 1831,
        wow: 'lol'
      },
      'birth-date': {
        qte: '1970-01-01'
      }
    },
    json: {"what":{"hello":{"wow":{"cool":true}}}},
    eJson: {"what":{"hello":{"wow":{"cool":true}}}},
    brokenjson: '{"what":{"hello":{"wow":{"coox:true}}}}'
  })
})
*/
