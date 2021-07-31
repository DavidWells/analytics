import { isBrowser } from '@analytics/type-utils'
import { decodeUri } from './decodeUri'

/**
 * Get search string from given url
 * @param  {string} [url] - optional url string. If no url, window.location.search will be used
 * @return {string} url search string
 */
function getSearchString(url) {
  if (url) {
    const p = url.match(/\?(.*)/)
    return (p && p[1]) ? p[1].split('#')[0] : ''
  }
  return isBrowser && window.location.search.substring(1)
}

/**
 * Parse url parameters into javascript object
 * @param  {string} [url] - URI to parse. If no url supplied window.location will be used
 * @return {object} parsed url parameters
 */
export function paramsParse(url) {
  return getParamsAsObject(getSearchString(url))
}

/*
?first=abc&a[]=123&a[]=false&b[]=str&c[]=3.5&a[]=last
https://random.url.com?Target=Report&Method=getStats&fields%5B%5D=Offer.name&fields%5B%5D=Advertiser.company&fields%5B%5D=Stat.clicks&fields%5B%5D=Stat.conversions&fields%5B%5D=Stat.cpa&fields%5B%5D=Stat.payout&fields%5B%5D=Stat.date&fields%5B%5D=Stat.offer_id&fields%5B%5D=Affiliate.company&groups%5B%5D=Stat.offer_id&groups%5B%5D=Stat.date&filters%5BStat.affiliate_id%5D%5Bconditional%5D=EQUAL_TO&filters%5BStat.affiliate_id%5D%5Bvalues%5D=1831&limit=9999
https://random.url.com?Target=Offer&Method=findAll&filters%5Bhas_goals_enabled%5D%5BTRUE%5D=1&filters%5Bstatus%5D=active&fields%5B%5D=id&fields%5B%5D=name&fields%5B%5D=default_goal_name
http://localhost:3000/?Target=Offer&Method=findAll&filters[has_goals_enabled][TRUE]=1&filters[status]=active&filters[wow]arr[]=yaz&filters[wow]arr[]=naz&fields[]=id&fields[]=name&fields[]=default_goal_name */
function getParamsAsObject(query) {
  let params = {}
  let temp
  const re = /([^&=]+)=?([^&]*)/g

  while (temp = re.exec(query)) {
    var k = decodeUri(temp[1])
    var v = decodeUri(temp[2])
    if (k.substring(k.length - 2) === '[]') {
      k = k.substring(0, k.length - 2);
      (params[k] || (params[k] = [])).push(v)
    } else {
      params[k] = (v === '') ? true : v
    }
  }

  for (var prop in params) {
    var arr = prop.split('[')
    if (arr.length > 1) {
      assign(params, arr.map((x) => x.replace(/[?[\]\\ ]/g, '')), params[prop])
      delete params[prop]
    }
  }
  return params
}

function assign(obj, keyPath, value) {
  var lastKeyIndex = keyPath.length - 1
  for (var i = 0; i < lastKeyIndex; ++i) {
    var key = keyPath[i]
    if (!(key in obj)) { 
      obj[key] = {} 
    }
    obj = obj[key]
  }
  obj[keyPath[lastKeyIndex]] = value
}


/*
https://github.com/choojs/nanoquery/blob/791cbdfe49cc380f0b2f93477572128946171b46/browser.js
var reg = /([^?=&]+)(=([^&]*))?/g

function qs (url) {
  var obj = {}
  url.replace(/^.*\?/, '').replace(reg, function (a0, a1, a2, a3) {
    var value = decodeURIComponent(a3)
    var key = decodeURIComponent(a1)
    if (obj.hasOwnProperty(key)) {
      if (Array.isArray(obj[key])) obj[key].push(value)
      else obj[key] = [obj[key], value]
    } else {
      obj[key] = value
    }
  })
  return obj
}
*/