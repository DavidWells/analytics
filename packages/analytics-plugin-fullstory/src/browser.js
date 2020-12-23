/* global FS */
const camelCase = require('camelcase')

const defaultConfig = {
  org: '',
  debug: false
}

/**
 * FullStory Analytics plugin
 * @link https://getanalytics.io/plugins/fullstory/
 * @link https://help.fullstory.com/hc/en-us/sections/360003732794-JavaScript-API
 * @param {object} pluginConfig - Plugin settings
 * @param {string} pluginConfig.org - FullStory account's `org` ID. The `_fs_org` value in settings.
 * @return {object} Analytics plugin
 * @example
 *
 * fullStoryPlugin({
 *   org: 'your-org-name'
 * })
 */
function fullStoryPlugin(pluginConfig = {}) {
  const source = 'analytics'
  return {
    name: 'fullstory',
    config: {
      ...defaultConfig,
      ...pluginConfig
    },
    initialize: ({ config }) => {
      if (!config.org) {
        throw new Error('No org name supplied for fullstory')
      }
      if (!scriptAlreadyLoaded()) {
        // Create script & append to DOM
        let script = document.createElement('script')
        script.type = 'text/javascript'
        script.async = true
        script.crossOrigin = 'anonymous'
        script.src = `https://edge.fullstory.com/s/fs.js`

        /* script.addEventListener('load', () => {
          isLoaded = true
        }) */
        // Catch any errors while loading the script
        script.addEventListener('error', () => {
          throw new Error(`Full story failed to load.`)
        })
        // On next tick, inject the script
        setTimeout(() => {
          let firstScript = document.getElementsByTagName('script')[0]
          firstScript.parentNode.insertBefore(script, firstScript)
        }, 0)
      }

      window._fs_debug = config.debug
      window._fs_host = 'www.fullstory.com'
      window._fs_org = config.org
      window._fs_namespace = 'FS'

      /* eslint-disable */
      ;(function(m,n,e,t,l,o,g,y){
        if (e in m) {if(m.console && m.console.log) { m.console.log('FullStory namespace conflict. Please set window["_fs_namespace"].');} return;}
        g=m[e]=function(a,b,s){g.q?g.q.push([a,b,s]):g._api(a,b,s);};g.q=[];
        g.identify=function(i,v,s){g(l,{uid:i},s);if(v)g(l,v,s)};g.setUserVars=function(v,s){g(l,v,s)};g.event=function(i,v,s){g('event',{n:i,p:v},s)};
        g.shutdown=function(){g("rec",!1)};g.restart=function(){g("rec",!0)};
        g.consent=function(a){g("consent",!arguments.length||a)};
        g.identifyAccount=function(i,v){o='account';v=v||{};v.acctId=i;g(o,v)};
        g.clearUserCookie=function(){};
      })(window,document,window['_fs_namespace'],'script','user');
      /* eslint-enable */
    },
    // https://help.fullstory.com/hc/en-us/articles/360020828113-FS-identify-Identifying-users
    // https://help.fullstory.com/hc/en-us/articles/360020623294-FS-setUserVars-Recording-custom-user-data
    identify: ({ payload, config }) => {
      const { userId, anonymousId, traits } = payload
      if (typeof FS === 'undefined') return false
      const userTraits = formatPayload(traits, true)
      if (userId) {
        FS.identify(userId, userTraits, source)
      } else {
        userTraits.analyticsAnonymousId_str = anonymousId
        FS.setUserVars(userTraits, source)
      }
    },
    /* https://help.fullstory.com/hc/en-us/articles/360020623234 */
    track: ({ payload, options, config }) => {
      if (typeof FS === 'undefined') return false
      const eventData = formatPayload(payload.properties)
      FS.event(payload.event, eventData, source)
    },
    loaded: () => {
      return !!window.FS
    },
  }
}

export default fullStoryPlugin

/* Full story formatting reqs https://help.fullstory.com/hc/en-us/articles/360020623234 */
const suffixes = ['str', 'int', 'date', 'real', 'bool', 'strs', 'ints', 'dates', 'reals', 'bools']
export function formatPayload(traits, ignoreReservedKeys) {
  return Object.keys(traits).reduce((acc, curr) => {
    const value = traits[curr]
    if (ignoreReservedKeys && isSpecialKey(curr)) {
      acc[curr] = value
      return acc
    }
    /* Format values for fullstory */
    const hasSuffix = suffixes.find((suffix) => {
      return curr.endsWith(`_${suffix}`)
    })
    if (hasSuffix) {
      const cleanKey = curr.replace(`_${hasSuffix}`, '')
      acc[`${camelCase(cleanKey)}_${hasSuffix}`] = value
      return acc
    }
    // If no suffix exists, add one
    const suffix = getSuffix(value)
    acc[`${camelCase(curr)}_${suffix}`] = value
    return acc
  }, {})
}

const specialKeys = ['displayName', 'email', 'uid', 'acctId', 'website']
function isSpecialKey(key) {
  return specialKeys.includes(key)
}

function getSuffix(value) {
  if (Array.isArray(value)) {
    if (value.every((v) => typeof v === 'string')) {
      return 'strs'
    }
    if (value.every((v) => typeof v === 'boolean')) {
      return 'bools'
    }
    if (value.every((v) => typeof v === 'number')) {
      return isInt(value)
    }
    if (value.every((v) => v instanceof Date)) {
      return 'dates'
    }
  }
  if (value instanceof Date) {
    return 'date'
  }
  switch (typeof value) {
    case 'string':
      return 'str'
    case 'boolean':
      return 'bool'
    case 'number':
      return isInt(value)
    default:
      return 'str'
  }
}

function isInt(value) {
  return (value % 1 != 0) ? 'real' : 'int' // eslint-disable-line
}

function scriptAlreadyLoaded() {
  const scripts = document.getElementsByTagName('script')
  return !!Object.keys(scripts).filter((key) => {
    const { src } = scripts[key]
    return src.match(/fullstory\.com\/s\/fs/)
  }).length
}
