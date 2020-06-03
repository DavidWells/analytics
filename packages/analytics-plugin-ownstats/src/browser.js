let globalConfig = {
  endpoint: null
};

const send = function(data) {
  const qs = [];
  // Build querystring
  for (var property in data) {
    if (data.hasOwnProperty(property)) {
      qs.push(property+'='+encodeURIComponent(data[property].toString()));
    }
  }
  // Trigger request
  var p = new Image(1,1);
  p.id = 'ownsp';
  p.src = globalConfig.reqUrl + '?' + qs.join('&');
}

/**
 * Ownstats analytics plugin
 * @link https://getanalytics.io/plugins/ownstats/
 * @link https://ownstats.cloud
 * @param {object}  pluginConfig - Plugin settings
 * @param {string}  pluginConfig.endpoint - Your Ownstats endpoint
 * @param {boolean}  pluginConfig.useAutomation - Automatically trigger pageviews upon route changes
 * @param {boolena}  pluginConfig.debug - Debug mode (necessary for localhost testing)
 * @return {object} Analytics plugin
 * @example
 *
 * ownstatsPlugin({
 *   endpoint: 'my.ownstats.cloud',
 *   useAutomation: true,
 *   debug: true
 * })
 */
export default function ownstatsPlugin(pluginConfig) {
  // Hold loading state
  let isLoaded = false;
  // return object for analytics to use
  return {
    NAMESPACE: 'ownstats',
    /* All plugins require a name */
    name: 'ownstats-plugin',
    /* Everything else below this is optional depending on your plugin requirements */
    config: {
      ...globalConfig,
      ...pluginConfig
    },
    initialize: ({ config }) => {
      console.log(Object.getOwnPropertyNames(config))
      // Store endpoint
      globalConfig.endpoint = config.endpoint;
      // Store URL
      globalConfig.reqUrl = `https://${config.endpoint}/hello.gif`;
      // Store automation switch
      globalConfig.useAutomation = pluginConfig.useAutomation ? true : false;
      // Store debug mode
      globalConfig.debug = pluginConfig.debug ? true : false;
      // Check if we use page change automation
      if (globalConfig.useAutomation) {
        var dis = window.dispatchEvent;
        var his = window.history;
        try {
          // Normal navigation
          var hisPushState = his ? his.pushState : null;
          if (hisPushState && Event && dis) {
            var stateListener = function(type) {
              var orig = his[type];
              return function() {
                var rv = orig.apply(this, arguments);
                var event = new Event(type);
                event.arguments = arguments;
                dis(event);
                return rv;
              };
            };
            his.pushState = stateListener('pushState');
            window.addEventListener('pushState', function() {
              if (window.Analytics) window.Analytics.page();
            });
          }
          // SPA navigation
          if ('onhashchange' in window) {
            window.onhashchange = function() {
              if (window.Analytics) window.Analytics.page();
            }
          }
          // Signal load
          isLoaded = true;
          // Trigger
          if (window.Analytics) window.Analytics.page();
        } catch (e) {
          console.log(e);
        }
      } else {
        // Signal load
        isLoaded = true;
      }
    },
    // See https://github.com/DavidWells/analytics/blob/master/packages/analytics-core/src/index.js#L336
    page: ({ payload, config }) => {
      var nav = window.navigator;
      var loc = window.location;
      var doc = window.document;
      var sc = window.screen;
      var userAgent = nav.userAgent;

      // Cancel sending in special cases
      if (userAgent.search(/(bot|spider|crawl)/ig) > -1) return;
      if ('visibilityState' in doc && doc.visibilityState === 'prerender') return;
      if (!globalConfig.debug) {
        if (loc.hostname === 'localhost' || loc.protocol === 'file:') return;
      }

      var url = loc.protocol + '//' + loc.hostname + loc.pathname;

      // Add hash to url when script is put in to hash mode
      if (loc.hash) url += loc.hash.split('?')[0];

      // Get references
      var refMatches = loc.search.match(/[?&](utm_source|source|ref)=([^?&]+)/gi);
      var refs = refMatches ? refMatches.map(function(m) { return m.split('=')[1] }) : [];
      // UTM
      var utmMatches = loc.search.match(/[?&](utm_source|utm_campaign|utm_medium|utm_content|utm_term)=([^?&]+)/gi);
      var utms = utmMatches ? utmMatches : [];

      // Populate
      var data = { t: 'pv', ts: payload.meta.timestamp, u: url, hn: loc.hostname, pa: loc.pathname };
      if (userAgent) data.ua = userAgent;
      if (refs && refs[0]) data.s = refs[0];
      if (doc.referrer) data.r = doc.referrer;
      if (payload.properties.width) data.iw = payload.properties.width;
      if (payload.properties.height) data.ih = payload.properties.height;
      if (payload.properties.title) data.ti = payload.properties.title;
      if (sc.width) data.w = sc.width;
      if (sc.height) data.h = sc.height;
      if (sc.pixelDepth) data.d = sc.pixelDepth;
      if (nav.language) data.l = nav.language;
      if (nav.platform) data.p = nav.platform;
      if (nav.deviceMemory) data.m = nav.deviceMemory;
      if (nav.hardwareConcurrency) data.c = nav.hardwareConcurrency;
      if (utms.length > 0) {
        utms.forEach(function (m) {
          var temp = m.replace('?', '').replace('&', '').split('=');
          var name = temp[0].split('_')[1];
          data['u'+name.substring(0,2)] = temp[1];
        });
      }

      try {
          data.tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      } catch (error) {
          // noop
      }
      // Send pageview data
      send(data);
    },
    // See https://github.com/DavidWells/analytics/blob/master/packages/analytics-core/src/index.js#L272
    track: ({ payload, instance }) => {
      const currentPageView = instance.getState('page.last')
      console.log('currentPageView data with timestamp', currentPageView)
      console.log(payload)
      // Metric names
      const perfMetricNames = ['fp', 'fcp', 'lcp', 'lcpFinal', 'fid', 'cls', 'clsFinal', 'tbt', 'tbt10S', 'tbtFinal'];
      // Extract location
      const loc = window.location;
      // Data to send
      let data = { t: 'tr', ts: payload.meta.timestamp, u: loc.protocol + '//' + loc.hostname + loc.pathname, hn: loc.hostname, pa: loc.pathname, en: payload.event, pr: JSON.stringify(payload.properties) };
      // Check if it's a performance metric event
      if (perfMetricNames.includes(payload.event)) {
        // Overwrite event type
        data.t = 'pm'; // Performance measurement
      }
      send(data);
    },
    // See https://github.com/DavidWells/analytics/blob/master/packages/analytics-core/src/index.js#L197
    identify: ({ payload }) => {
      let data = { t: 'id', ts: payload.meta.timestamp, uid: payload.userId, aid: payload.anonymousId, tr: JSON.stringify(payload.traits) };
      send(data);
    },
    loaded: () => {
      return !!isLoaded;
    }
  }
}
