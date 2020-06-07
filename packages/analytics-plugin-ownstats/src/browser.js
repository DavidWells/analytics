/**
 * Ownstats analytics plugin
 * @link https://getanalytics.io/plugins/ownstats/
 * @link https://ownstats.cloud
 * @param {object}  pluginConfig - Plugin settings
 * @param {string}  pluginConfig.endpoint - Your Ownstats endpoint
 * @param {boolean} pluginConfig.useAutomation - Automatically trigger pageviews upon route changes for single page applications
 * @param {boolena} pluginConfig.debug - Debug mode (necessary for localhost testing)
 * @return {object} Analytics plugin
 * @example
 *
 * ownstatsPlugin({
 *   endpoint: 'my.ownstats.cloud',
 *   useAutomation: true,
 *   debug: true
 * })
 */
function ownstatsPlugin(pluginConfig) {
  // Hold loading state
  let isLoaded = false

  let globalConfig = {
    endpoint: null
  }

  // return object for analytics to use
  return {
    /* All plugins require a name */
    name: 'ownstats',
    /* Everything else below this is optional depending on your plugin requirements */
    config: {
      ...globalConfig,
      ...pluginConfig
    },
    initialize: ({ config, instance }) => {
      // Store endpoint
      globalConfig.endpoint = config.endpoint
      // Store URL
      globalConfig.reqUrl = `https://${config.endpoint}/hello.gif`
      // Store automation switch
      globalConfig.useAutomation = pluginConfig.useAutomation ? true : false
      // Store debug mode
      globalConfig.debug = pluginConfig.debug ? true : false
      // Check if we want to use automaticPageView tracking
      if (globalConfig.useAutomation) {
        var dis = window.dispatchEvent
        var his = window.history
        try {
          // Normal navigation
          var hisPushState = his ? his.pushState : null
          if (hisPushState && Event && dis) {
            var stateListener = function(type) {
              var orig = his[type]
              return function() {
                var rv = orig.apply(this, arguments)
                var event = new Event(type)
                event.arguments = arguments
                dis(event)
                return rv
              }
            }
            his.pushState = stateListener('pushState')
            window.addEventListener('pushState', function() {
              instance.page()
            })
          }
          // SPA navigation
          if ('onhashchange' in window) {
            window.onhashchange = function() {
              instance.page()
            }
          }
          // Signal readiness
          isLoaded = true
          // Trigger first page view
          instance.page()
        } catch (e) {
          console.log(e)
        }
      } else {
        // Signal readiness
        isLoaded = true
      }
    },
    page: ({ payload, config }) => {
      var nav = window.navigator
      var loc = window.location
      var doc = window.document
      var sc = window.screen
      var userAgent = nav.userAgent

      // Cancel sending in special cases
      if (userAgent.search(/(bot|spider|crawl)/ig) > -1) {
        return
      }
      if ('visibilityState' in doc && doc.visibilityState === 'prerender') {
        return
      }
      if (!globalConfig.debug) {
        if (loc.hostname === 'localhost' || loc.protocol === 'file:') {
          return
        }
      }

      // Get references
      var refMatches = loc.search.match(/[?&](utm_source|source|ref)=([^?&]+)/gi)
      var refs = refMatches ? refMatches.map(function(m) { return m.split('=')[1] }) : []
      // UTM
      var utmMatches = loc.search.match(/[?&](utm_source|utm_campaign|utm_medium|utm_content|utm_term)=([^?&]+)/gi)
      var utms = utmMatches ? utmMatches : []

      // Populate
      var data = { t: 'pv', ts: payload.meta.timestamp, u: payload.properties.url, hn: loc.hostname, pa: payload.properties.path }
      if (userAgent) data.ua = userAgent
      if (refs && refs[0]) data.s = refs[0]
      if (doc.referrer) data.r = doc.referrer
      if (payload.properties.width) data.iw = payload.properties.width
      if (payload.properties.height) data.ih = payload.properties.height
      if (payload.properties.title) data.ti = payload.properties.title
      if (sc.width) data.w = sc.width
      if (sc.height) data.h = sc.height
      if (sc.pixelDepth) data.d = sc.pixelDepth
      if (nav.language) data.l = nav.language
      if (nav.platform) data.p = nav.platform
      if (nav.deviceMemory) data.m = nav.deviceMemory
      if (nav.hardwareConcurrency) data.c = nav.hardwareConcurrency
      if (utms.length > 0) {
        utms.forEach(function (m) {
          var temp = m.replace('?', '').replace('&', '').split('=')
          var name = temp[0].split('_')[1]
          data['u'+name.substring(0,2)] = temp[1]
        })
      }

      try {
        data.tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      } catch (error) {
        // noop
      }
      // Send pageview data
      send(data, globalConfig)
    },
    loaded: () => {
      return !!isLoaded
    }
  }
}

export default ownstatsPlugin

function send(data, config) {
  const qs = []
  // Build querystring
  for (var property in data) {
    if (data.hasOwnProperty(property)) {
      qs.push(property+'='+encodeURIComponent(data[property].toString()))
    }
  }
  // Trigger request
  var p = new Image(1,1)
  var src = config.reqUrl + '?' + qs.join('&')
  p.id = 'ownsp'
  p.src = src
  if (config.debug) {
    console.log('sent ownstats request', src)
  }
}
