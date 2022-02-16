
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { 
  parseReferrer, 
  AFFILIATE,
  AGENT,
  DISPLAY,
  DIRECT,
  PAID_SEARCH,
  PAID_SOCIAL,
  SOCIAL,
  SEARCH,
  NA,
  UNKNOWN,
} from '../src'

test.after(() => console.log('tests done'))

test('API is exposed', async () => {
  assert.is(typeof parseReferrer, 'function')
})

function clean(obj) {
  delete obj.ts
  return obj
}

test('parseReferrer search', async () => {

  const url = 'http://www.google.com'
  const search = parseReferrer(url)
  // console.log('search', search)
  assert.equal(clean(search), {
    type: SEARCH,
    domain: 'google.com',
    hostname: 'www.google.com',
    referrer: url,
    term: NA,
    value: 'google',
    isExternal: true
  })
  
  const googleUrl = 'http://www.google.com/search?q=gateway+oracle+cards+denise+linn&hl=en&client=safari'
  const googleSearch = parseReferrer(googleUrl)
  // console.log('googleSearch', googleSearch)
  assert.equal(clean(googleSearch), {
    type: SEARCH,
    domain: 'google.com',
    hostname: 'www.google.com',
    referrer: googleUrl,
    term: 'gateway+oracle+cards+denise+linn',
    value: 'google',
    isExternal: true
  })

  const bingUrl = 'http://www.bing.com/search?q=gateway+oracle+cards+denise+linn&hl=en&client=safari'
  const bingSearch = parseReferrer(bingUrl)
  // console.log('bingSearch', bingSearch)
  assert.equal(clean(bingSearch), {
    type: SEARCH,
    domain: 'bing.com',
    hostname: 'www.bing.com',
    referrer: bingUrl,
    term: 'gateway+oracle+cards+denise+linn',
    value: 'bing',
    isExternal: true
  })

  const duckduckUrl = 'https://duckduckgo.com/?q=tester&t=h_&ia=web'
  const duckduckSearch = parseReferrer(duckduckUrl)
  // console.log('duckduckSearch', duckduckSearch)
  assert.equal(clean(duckduckSearch), {
    type: SEARCH,
    domain: 'duckduckgo.com',
    hostname: 'duckduckgo.com',
    referrer: duckduckUrl,
    term: 'tester',
    value: 'duckduckgo',
    isExternal: true
  })
})

test('parseReferrer direct', async () => {
  const urlOne = 'https://github.com'
  const one = parseReferrer(urlOne)
  // console.log('direct one', one)
  assert.equal(clean(one), { 
    type: DIRECT,
    domain: 'github.com',
    hostname: 'github.com',
    referrer: urlOne,
    isExternal: true
  })

  const urlTwo = 'https://lololol.coool.com/path/to/thing-xyz'
  const two = parseReferrer(urlTwo)
  // console.log('direct two', two)
  assert.equal(clean(two), { 
    type: DIRECT,
    domain: 'coool.com',
    hostname: 'lololol.coool.com',
    referrer: urlTwo,
    isExternal: true
  })

  const inbound = parseReferrer('http://hahaa.site-xyz.com/lol', 'http://glocal.com/')
  // console.log('inbound', inbound)
  assert.equal(clean(inbound), {
    type: DIRECT,
    domain: 'site-xyz.com',
    hostname: 'hahaa.site-xyz.com',
    referrer: "http://hahaa.site-xyz.com/lol",
    isExternal: true
  })
})

test('parseReferrer social', async () => {
  const twitterUrl = 'https://twitter.com'
  const twitterSocial = parseReferrer(twitterUrl)
  console.log('twitterSocial', twitterSocial)
  assert.equal(clean(twitterSocial), {
    type: SOCIAL,
    domain: 'twitter.com',
    hostname: 'twitter.com',
    referrer: twitterUrl,
    isExternal: true
  })

  const fbUrl = 'https://facebook.com'
  const fbSocial = parseReferrer(fbUrl)
  console.log('fbSocial', fbSocial)
  assert.equal(clean(fbSocial), {
    type: SOCIAL,
    domain: 'facebook.com',
    hostname: 'facebook.com',
    referrer: fbUrl,
    isExternal: true
  })
})

test('parseReferrer affiliate', async () => {
  const affiliate = parseReferrer('http://hahaa.site-xyz.com/lol', 'http://glocal.com/?ref=davidwells')
  // console.log('affiliate', affiliate)
  assert.equal(clean(affiliate), {
    type: AFFILIATE,
    domain: 'site-xyz.com',
    hostname: 'hahaa.site-xyz.com',
    referrer: "http://hahaa.site-xyz.com/lol",
    value: "davidwells",
    isExternal: true
  })
})



test.run()
