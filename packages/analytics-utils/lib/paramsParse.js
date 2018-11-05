import inBrowser from './inBrowser'
import decode from './decodeUri'

function getSearchString(url) {
  if (url) {
    const p = url.match(/\?(.*)/)
    return (p && p[1]) ? p[1].split('#')[0] : ''
  }
  return inBrowser && window.location.search.substring(1)
}

export default function paramsParse(url) {
  const searchString = getSearchString(url)
  return (searchString) ? getParamsAsObject(searchString) : {}
}

/*
?first=abc&a[]=123&a[]=false&b[]=str&c[]=3.5&a[]=last
https://random.url.com?Target=Report&Method=getStats&fields%5B%5D=Offer.name&fields%5B%5D=Advertiser.company&fields%5B%5D=Stat.clicks&fields%5B%5D=Stat.conversions&fields%5B%5D=Stat.cpa&fields%5B%5D=Stat.payout&fields%5B%5D=Stat.date&fields%5B%5D=Stat.offer_id&fields%5B%5D=Affiliate.company&groups%5B%5D=Stat.offer_id&groups%5B%5D=Stat.date&filters%5BStat.affiliate_id%5D%5Bconditional%5D=EQUAL_TO&filters%5BStat.affiliate_id%5D%5Bvalues%5D=1831&limit=9999
https://random.url.com?Target=Offer&Method=findAll&filters%5Bhas_goals_enabled%5D%5BTRUE%5D=1&filters%5Bstatus%5D=active&fields%5B%5D=id&fields%5B%5D=name&fields%5B%5D=default_goal_name
http://localhost:3000/?Target=Offer&Method=findAll&filters[has_goals_enabled][TRUE]=1&filters[status]=active&filters[wow]arr[]=yaz&filters[wow]arr[]=naz&fields[]=id&fields[]=name&fields[]=default_goal_name */
function getParamsAsObject(query) {
  const re = /([^&=]+)=?([^&]*)/g
  let params = {}
  let e
  while (e = re.exec(query)) { // eslint-disable-line
    var k = decode(e[1]); var v = decode(e[2])
    if (k.substring(k.length - 2) === '[]') {
      k = k.substring(0, k.length - 2);
      (params[k] || (params[k] = [])).push(v)
    } else {
      var val = (v === '') ? true : v
      params[k] = val
    }
  }

  for (var prop in params) {
    var structure = prop.split('[')
    if (structure.length > 1) {
      var levels = []
      structure.forEach((item, i) => { // eslint-disable-line
        var key = item.replace(/[?[\]\\ ]/g, '')
        levels.push(key)
      })
      assign(params, levels, params[prop])
      delete (params[prop])
    }
  }
  return params
}

function assign(obj, keyPath, value) {
  var lastKeyIndex = keyPath.length - 1
  for (var i = 0; i < lastKeyIndex; ++i) {
    var key = keyPath[i]
    if (!(key in obj)) { obj[key] = {} }
    obj = obj[key]
  }
  obj[keyPath[lastKeyIndex]] = value
}
