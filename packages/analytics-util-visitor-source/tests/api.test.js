
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { 
  parseReferrer, 
  AFFILIATE,
  DIRECT,
  INBOUND,
  SOCIAL,
  SEARCH,
  NA,
} from '../src'

test.after(() => console.log('tests done'))

test('API is exposed', async () => {
  assert.is(typeof parseReferrer, 'function')
})

function clean(obj) {
  delete obj.date
  delete obj.entry
  return obj
}

test('parseReferrer search', async () => {

  const url = 'http://www.google.com'
  const search = parseReferrer(url)
  // console.log('search', search)
  assert.equal(clean(search), {
    type: SEARCH,
    // date: '2022-03-18T02:55:41.871Z',
    // entry: { url: '://', search: '', hash: '' },
    referrer: {
      url: 'http://www.google.com',
      hostname: 'www.google.com',
      domain: 'google.com',
      isExternal: true,
      isInternal: false,
      isInternalSubDomain: false
    },
    data: { term: 'na', name: 'google' }
  })
  
  const googleUrl = 'http://www.google.com/search?q=gateway+oracle+cards+denise+linn&hl=en&client=safari'
  const googleSearch = parseReferrer(googleUrl)
  // console.log('googleSearch', googleSearch)
  assert.equal(clean(googleSearch), {
    type: 'search',
    // date: '2022-03-18T02:56:12.615Z',
    // entry: { url: '://', search: '', hash: '' },
    referrer: {
      url: 'http://www.google.com/search?q=gateway+oracle+cards+denise+linn&hl=en&client=safari',
      hostname: 'www.google.com',
      domain: 'google.com',
      isExternal: true,
      isInternal: false,
      isInternalSubDomain: false
    },
    data: { term: 'gateway+oracle+cards+denise+linn', name: 'google' }
  })

  const bingUrl = 'http://www.bing.com/search?q=gateway+oracle+cards+denise+linn&hl=en&client=safari'
  const bingSearch = parseReferrer(bingUrl)
  // console.log('bingSearch', bingSearch)
  assert.equal(clean(bingSearch), {
    type: 'search',
    // date: '2022-03-18T02:56:36.452Z',
    // entry: { url: '://', search: '', hash: '' },
    referrer: {
      url: 'http://www.bing.com/search?q=gateway+oracle+cards+denise+linn&hl=en&client=safari',
      hostname: 'www.bing.com',
      domain: 'bing.com',
      isExternal: true,
      isInternal: false,
      isInternalSubDomain: false
    },
    data: { term: 'gateway+oracle+cards+denise+linn', name: 'bing' }
  })

  const duckduckUrl = 'https://duckduckgo.com/?q=tester&t=h_&ia=web'
  const duckduckSearch = parseReferrer(duckduckUrl)
  // console.log('duckduckSearch', duckduckSearch)
  assert.equal(clean(duckduckSearch), {
    type: 'search',
    // date: '2022-03-18T02:56:54.655Z',
    // entry: { url: '://', search: '', hash: '' },
    referrer: {
      url: 'https://duckduckgo.com/?q=tester&t=h_&ia=web',
      hostname: 'duckduckgo.com',
      domain: 'duckduckgo.com',
      isExternal: true,
      isInternal: false,
      isInternalSubDomain: false
    },
    data: { term: 'tester', name: 'duckduckgo' }
  })
})

test('parseReferrer inbound link', async () => {
  const urlOne = 'https://github.com'
  const one = parseReferrer(urlOne)
  // console.log('direct one', one)
  assert.equal(clean(one), {
    type: INBOUND,
    // date: '2022-03-18T02:53:29.982Z',
    // entry: { url: '://', search: '', hash: '' },
    referrer: {
      url: 'https://github.com',
      hostname: 'github.com',
      domain: 'github.com',
      isExternal: true,
      isInternal: false,
      isInternalSubDomain: false
    }
  })

  const urlTwo = 'https://lololol.coool.com/path/to/thing-xyz'
  const two = parseReferrer(urlTwo)
  // console.log('direct two', two)
  assert.equal(clean(two), {
    type: INBOUND,
    // date: '2022-03-18T02:54:20.863Z',
    // entry: { url: '://', search: '', hash: '' },
    referrer: {
      url: 'https://lololol.coool.com/path/to/thing-xyz',
      hostname: 'lololol.coool.com',
      domain: 'coool.com',
      isExternal: true,
      isInternal: false,
      isInternalSubDomain: false
    }
  })

  const inbound = parseReferrer('http://hahaa.site-xyz.com/lol', 'http://glocal.com/')
  // console.log('inbound', inbound)
  assert.equal(clean(inbound), {
    type: INBOUND,
    // date: '2022-03-18T02:54:49.513Z',
    // entry: { url: 'http://glocal.com', search: '', hash: '' },
    referrer: {
      url: 'http://hahaa.site-xyz.com/lol',
      hostname: 'hahaa.site-xyz.com',
      domain: 'site-xyz.com',
      isExternal: true,
      isInternal: false,
      isInternalSubDomain: false
    }
  })
})

test('parseReferrer social', async () => {
  const twitterUrl = 'https://twitter.com'
  const twitterSocial = parseReferrer(twitterUrl)
  // console.log('twitterSocial', twitterSocial)
  assert.equal(clean(twitterSocial), {
    type: SOCIAL,
    // date: '2022-03-18T02:51:38.993Z',
    // entry: { url: '://', search: '', hash: '' },
    referrer: {
      url: 'https://twitter.com',
      hostname: 'twitter.com',
      domain: 'twitter.com',
      isExternal: true,
      isInternal: false,
      isInternalSubDomain: false
    },
    data: { site: 'twitter.com' }
})

  const fbUrl = 'https://facebook.com'
  const fbSocial = parseReferrer(fbUrl)
  // console.log('fbSocial', fbSocial)
  assert.equal(clean(fbSocial), {
    type: SOCIAL,
    // date: '2022-03-18T02:52:11.628Z',
    // entry: { url: '://', search: '', hash: '' },
    referrer: {
      url: 'https://facebook.com',
      hostname: 'facebook.com',
      domain: 'facebook.com',
      isExternal: true,
      isInternal: false,
      isInternalSubDomain: false
    },
    data: { site: 'facebook.com' }
  })
})

test('parseReferrer affiliate', async () => {
  const affiliate = parseReferrer('http://hahaa.site-xyz.com/lol', 'http://glocal.com/?ref=davidwells')
  assert.equal(clean(affiliate), {
    type: AFFILIATE,
    // date: '2022-03-18T02:32:01.689Z',
    // entry: { url: 'http://glocal.com', search: 'ref=davidwells', hash: '' },
    referrer: {
      url: 'http://hahaa.site-xyz.com/lol',
      hostname: 'hahaa.site-xyz.com',
      domain: 'site-xyz.com',
      isExternal: true,
      isInternal: false,
      isInternalSubDomain: false
    },
    data: { id: 'davidwells' }
  })
})



test.run()
