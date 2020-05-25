const config = {
  endpoint: null
};

/**
 * Ownstats analytics plugin
 * @link https://getanalytics.io/plugins/ownstats/
 * @link https://ownstats.cloud
 * @param {object}  pluginConfig - Plugin settings
 * @param {string}  pluginConfig.endpoint - Your Ownstats endpoint
 * @return {object} Analytics plugin
 * @example
 *
 * ownstatsPlugin({
 *   endpoint: 'my.ownstats.cloud'
 * })
 */
export default function ownstatsPlugin(pluginConfig) {
  // Hold loading state
  let isLoaded = false;
  // Flattening function for nested objects
  const flatten = function (ob, prefix) {
    const toReturn = {};
    prefix = prefix ? prefix + '.' : '';
    for (let i in ob) {
      if (!ob.hasOwnProperty(i)) continue;
      if (typeof ob[i] === 'object' && ob[i] !== null) {
        // Recursion on deeper objects
        Object.assign(toReturn, flatten(ob[i], prefix + i));
      } else {
        toReturn[prefix + i] = ob[i];
      }
    }
    return toReturn;
  }
  const send = function(data) {
    const qs = [];
    // Flatten data
    const flattenedData = flatten(data);
    // Build querystring
    for (var property in flattenedData) {
      if (flattenedData.hasOwnProperty(property)) {
        qs.push(property+'='+encodeURIComponent(flattenedData[property].toString()));
      }
    }
    // Trigger request
    var p = new Image(1,1);
    p.id = 'ownsp';
    p.src = config.reqUrl + '?' + qs.join('&');
  }
  // return object for analytics to use
  return {
    NAMESPACE: 'ownstats',
    /* All plugins require a name */
    name: 'ownstats-plugin',
    /* Everything else below this is optional depending on your plugin requirements */
    config: {
      ...config,
      ...pluginConfig
    },
    initialize: ({ config }) => {
      var dis = window.dispatchEvent;
      var his = window.history;
      // Store URL
      config.reqUrl = `https://${config.endpoint}/hello.gif`;
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
            //page(true);
          });
        }
        // SPA navigation
        if ('onhashchange' in window) {
          window.onhashchange = function() {
            //page(true);
          }
        }
        // Signal load
        isLoaded = true;
        // Trigger
        //page();
      } catch (e) {
        //console.log(e);
      }
    },
    // See https://github.com/DavidWells/analytics/blob/master/packages/analytics-core/src/index.js#L336
    page: ({ payload }) => {
      // call provider specific page tracking
      var nav = window.navigator;
      var loc = window.location;
      var doc = window.document;
      var sc = window.screen;
      var userAgent = nav.userAgent;

      // Cancel sending in special cases
      if (userAgent.search(/(bot|spider|crawl)/ig) > -1) return;
      if ('visibilityState' in doc && doc.visibilityState === 'prerender') return;
      if (loc.hostname === 'localhost' || loc.protocol === 'file:') return;

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
      var data = { t: 'pageview', u: url, hn: loc.hostname };
      if (userAgent) data.ua = userAgent;
      if (refs && refs[0]) data.s = refs[0];
      if (doc.referrer) data.r = doc.referrer;
      if (window.innerWidth) data.iw = window.innerWidth;
      if (window.innerWidth) data.ih = window.innerHeight;
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
    track: ({ payload }) => {
      let data = { t: 'track', ...payload }
      send(data);
    },
    // See https://github.com/DavidWells/analytics/blob/master/packages/analytics-core/src/index.js#L197
    identify: ({ payload }) => {
      // There's no identify implementation with Ownstats
      return true;
    },
    loaded: () => {
      // return boolean so analytics knows when it can send data to third party
      return !!isLoaded;
    }
  }
}