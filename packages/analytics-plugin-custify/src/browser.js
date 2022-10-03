/* global _ctrack */

function custifyPlugin(pluginConfig = {}) {
  return {
    name: 'custify',
    config: pluginConfig,
    methods: {
      trackTime: (pageName, idleTimer) => {
        if (!_ctrack || typeof _ctrack.trackTime  === 'undefined') {
          return
        }
        _ctrack.trackTime(true, {module: pageName, idleTimer})
      },
      stopTrackTime: () => {
        if (!_ctrack || typeof _ctrack.stopTrackTime  === 'undefined') {
          return
        }
        _ctrack.stopTrackTime();
      },
      setOptions: (options) => {
        if (!_ctrack || typeof _ctrack.setOptions  === 'undefined') {
          return
        }
        _ctrack.setOptions(options);
      },
    },
    initialize: ({ config }) => {
      const { accountId, allowCreate } = config
      if (!accountId) {
        throw new Error('No custify accountId defined')
      }

      // Create script & append to DOM
      let script = document.createElement('script')
      script.id = 'cs-script-loader'
      script.type = 'text/javascript'
      script.innerHTML = `
        var _ctrack = _ctrack || [];
        (function () {
            for (var t = ["identify", "track", "setInstance", "setAccount", "trackTime", "stopTrackTime", "debug", "setOptions"], a = function (t) {
                return function () {
                    _ctrack.push([t].concat(Array.prototype.slice.call(arguments, 0)))
                }
            }, n = 0; n < t.length; n++) _ctrack[t[n]] = a(t[n])
            var d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
            g.type = 'text/javascript';
            g.async = true;
            g.defer = true;
            g.src = 'https://assets.custify.com/assets/track.min.js';
            s.parentNode.insertBefore(g, s);
        })();

      _ctrack.setAccount("${accountId}");
      _ctrack.setOptions({
          createOrUpdateEntities: ${allowCreate}
      });
    `
      // On next tick, inject the script
      setTimeout(() => {
        let firstScript = document.getElementsByTagName('script')[0]
        firstScript.parentNode.insertBefore(script, firstScript)
      }, 0)
    },
    /**
     * Identify a visitor in custify
     * analytics.identify({
     *   name: 'bob',
     *   email: 'bob@bob.com' // email is required
     * })
     */
    identify: ({ payload }) => {
      const { userId, traits } = payload
      if (typeof _ctrack === 'undefined' || !traits.email) {
        return
      }
      /* send custify identify call */
      const properties = {userId, email: traits.email, companyId: traits.companyId}
      // Identify will send with next event or page view.
      _ctrack.identify(properties)

    },
    page: ({ payload }) => {
      if (typeof _ctrack === 'undefined') return
      /* ignore the first .page() call b/c custify tracking script already fired it */
      if (!initialPageViewFired) {
        initialPageViewFired = true
        return
      }
      // Set page path
      _ctrack.track('page-view', {...payload.properties})
    },
    track: ({ payload }) => {
      if (typeof _ctrack === 'undefined') return
      const {event, userId, properties} = payload
      _ctrack.track(event, {userId, ...properties})
    },
    reset: () => {
      if (typeof _ctrack === 'undefined') return
    },
    loaded: () => {
      return !!window._ctrack
    },
  }
}

export default custifyPlugin
