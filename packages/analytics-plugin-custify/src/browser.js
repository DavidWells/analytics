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
      const { accountId, scriptInclude, options } = config
      if (!accountId) {
        throw new Error('No custify accountId defined')
      }

      // Create script & append to DOM
      const _ctrack = window._ctrack || [];

      if(scriptInclude) {
        let methods = ["identify", "track", "setInstance", "setAccount", "trackTime", "stopTrackTime", "debug", "setOptions"];
        const methodHandler = (method) => () => _ctrack.push([method].concat(Array.prototype.slice.call(arguments, 0)));
        for (let n = 0; n < methods.length; n++) _ctrack[methods[n]] = methodHandler(methods[n]);

        window._ctrack = _ctrack;

        const script = document.createElement('script');
        const firstScript = document.getElementsByTagName('script')[0];
        script.type = 'text/javascript';
        script.async = true;
        script.defer = true;
        script.src = 'https://assets.custify.com/assets/track.min.js';
        firstScript.parentNode.insertBefore(script, firstScript);
      }

      _ctrack.setAccount(accountId);

      if(options) {
        _ctrack.setOptions(options);
      }
    },
    identify: ({ payload }) => {
      const { userId, traits } = payload
      if (typeof _ctrack === 'undefined' || !traits.email) {
        return
      }

      const { company, ...user } = traits

      const properties = {
        userId,
        email: user.email,
        company_id: company ? company.id : null,
      }

      _ctrack.identify(properties, { user, company })
    },
    page: ({ payload }) => {
      if (typeof _ctrack === 'undefined') return
      _ctrack.track('page-view', {...payload.properties})
    },
    track: ({ payload }) => {
      if (typeof _ctrack === 'undefined') return
      const {event, userId, properties} = payload
      _ctrack.track(event, {userId, ...properties})
    },
    loaded: () => {
      return !!window._ctrack
    },
  }
}

export default custifyPlugin
