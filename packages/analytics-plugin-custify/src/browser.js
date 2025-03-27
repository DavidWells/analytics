/* global _ctrack */

const defaultOpts = {
  scriptInclude: true
}

/**
 * Custify plugin
 * @link https://getanalytics.io/plugins/custify
 * @link https://docs.custify.com/
 * @link https://app.custify.com/settings/developer/js-snippet
 * @param {object} pluginConfig - Plugin settings
 * @param {string} pluginConfig.accountId - custify account ID
 * @param {boolean} [pluginConfig.scriptInclude = true] - Load custify script into page
 * @param {object}  [pluginConfig.options] - Custify script options
 * @return {AnalyticsPlugin}
 * @example
 *
 * // This will load crazy egg on to the page
 * custifyPlugin({
 *   accountId: '1234578'
 * })
 */
function custifyPlugin(pluginConfig = {}) {
  return {
    name: 'custify',
    config: {
      ...defaultOpts,
      ...pluginConfig
    },
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
      let _ctrack = window._ctrack || [];

      if (scriptInclude) {
        let methods = ["identify", "track", "setInstance", "setAccount", "trackTime", "stopTrackTime", "debug", "setOptions"];
        _ctrack = methods.reduce((acc, method) => {
          acc[method] = (...args) => {
            _ctrack.push([method, ...args]);
          };
          return acc;
        }, _ctrack);

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

      if (options) {
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
      }

      if(company) {
        properties.company_id = company.id
      }

      const {id,...companyRest} = company

      let {
        user_id,
        email,
        phone,
        signed_up_at,
        name,
        session_count,
        companies,
        custom_attributes,
        unsubscribed_from_emails,
        unsubscribed_from_calls,
        ...userRest
      } = user

      custom_attributes = {
        ...userRest,
        ...custom_attributes,
      }

      const newUser = {
        user_id,
        email,
        phone,
        signed_up_at,
        name,
        session_count,
        companies,
        custom_attributes,
        unsubscribed_from_emails,
        unsubscribed_from_calls,
      }

      _ctrack.identify(properties, { user: newUser, company: companyRest })
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