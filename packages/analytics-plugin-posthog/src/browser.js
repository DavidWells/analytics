/* global posthog */

const defaultConfig = {
  /* Your PostHog API key */
  apiKey: null,
  /* PostHog API host. Default: https://us.i.posthog.com */
  apiHost: 'https://us.i.posthog.com',
  /* Autocapture clicks, inputs, and page views */
  autocapture: true,
  /*
   * Automatically capture $pageview events.
   * Default: false — the analytics library manages page tracking via analytics.page(),
   * which calls posthog.capture('$pageview'). Setting this to true will cause duplicate
   * pageview events. Set to 'history_change' only if you are NOT calling analytics.page().
   */
  capturePageview: false,
  /*
   * Automatically capture $pageleave events when the user navigates away.
   * Default: false — disabled alongside capturePageview so the analytics library
   * has full control over page lifecycle tracking.
   */
  capturePageleave: false,
  /* Override the PostHog JS library URL */
  customScriptSrc: null,
  /* Additional posthog.init options https://posthog.com/docs/libraries/js#config */
  options: {},
}

/**
 * PostHog analytics plugin (browser)
 * @link https://getanalytics.io/plugins/posthog/
 * @link https://posthog.com/docs/libraries/js
 * @param {object}  pluginConfig - Plugin settings
 * @param {string}  pluginConfig.apiKey - Your PostHog project API key
 * @param {string}  [pluginConfig.apiHost] - PostHog API host (default: https://us.i.posthog.com)
 * @param {boolean} [pluginConfig.autocapture] - Enable autocapture (default: true)
 * @param {boolean|string} [pluginConfig.capturePageview] - Auto-capture $pageview (default: false). Disabled to avoid duplicates with analytics.page(). Set to 'history_change' only if NOT calling analytics.page().
 * @param {boolean} [pluginConfig.capturePageleave] - Auto-capture $pageleave events (default: false)
 * @param {string}  [pluginConfig.customScriptSrc] - Override the PostHog JS library URL
 * @param {object}  [pluginConfig.options] - Additional posthog.init options
 * @return {object} Analytics plugin
 * @example
 *
 * posthogPlugin({
 *   apiKey: 'phc_xxx',
 *   apiHost: 'https://us.i.posthog.com'
 * })
 */
function posthogPlugin(pluginConfig = {}) {
  const config = {
    ...defaultConfig,
    ...pluginConfig,
  }

  return {
    name: 'posthog',
    config: config,
    /* Load PostHog JS snippet on page */
    initialize: ({ config }) => {
      const { apiKey, apiHost, autocapture, capturePageview, capturePageleave, customScriptSrc, options } = config
      if (!apiKey) {
        throw new Error('No PostHog apiKey defined')
      }

      // NoOp if posthog already loaded by external source
      if (typeof window.posthog !== 'undefined' && window.posthog.__loaded) {
        return
      }

      /* eslint-disable */
      // PostHog JS snippet — sourced from https://posthog.com/docs/integrate/snippet
      !function(t, e) {
        var o, n, p, r
        if (!e.__SV) {
          window.posthog = e
          e._i = []
          e.init = function(i, s, a) {
            function g(t, e) {
              var o = e.split('.')
              2 == o.length && (t = t[o[0]], e = o[1])
              t[e] = function() {
                t.push([e].concat(Array.prototype.slice.call(arguments, 0)))
              }
            }
            (p = t.createElement('script')).type = 'text/javascript'
            p.crossOrigin = 'anonymous'
            p.async = !0
            p.src = customScriptSrc || s.api_host.replace('.i.posthog.com', '-assets.i.posthog.com') + '/static/array.js'
            ;(r = t.getElementsByTagName('script')[0]).parentNode.insertBefore(p, r)
            var u = e
            for (void 0 !== a ? u = e[a] = [] : a = 'posthog', u.people = u.people || [], u.toString = function(t) {
              var e = 'posthog'
              'posthog' !== a && (e += '.' + a)
              t || (e += ' (stub)')
              return e
            }, u.people.toString = function() {
              return u.toString(1) + '.people (stub)'
            }, o = 'init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug'.split(' '), n = 0; n < o.length; n++) g(u, o[n])
            e._i.push([i, s, a])
          }
          e.__SV = 1
        }
      }(document, window.posthog || [])
      /* eslint-enable */

      posthog.init(apiKey, {
        api_host: apiHost,
        autocapture: autocapture,
        capture_pageview: capturePageview,
        capture_pageleave: capturePageleave,
        ...options,
      })
    },
    /* Track page views https://posthog.com/docs/product-analytics/capture-events#single-page-apps-spa */
    page: ({ payload }) => {
      if (typeof posthog === 'undefined') return
      posthog.capture('$pageview', payload.properties || {})
    },
    /* Track custom events https://posthog.com/docs/product-analytics/capture-events */
    track: ({ payload }) => {
      if (typeof posthog === 'undefined') return
      posthog.capture(payload.event, payload.properties)
    },
    /* Identify a user https://posthog.com/docs/product-analytics/identify */
    identify: ({ payload }) => {
      if (typeof posthog === 'undefined') return
      const { userId, traits } = payload
      if (typeof userId === 'string') {
        posthog.identify(userId, traits)
      } else if (traits) {
        posthog.setPersonProperties(traits)
      }
    },
    /* Check if PostHog has loaded */
    loaded: () => {
      return !!(window.posthog && window.posthog.__loaded)
    },
    /* Reset user data on logout https://posthog.com/docs/product-analytics/identify#reset-after-logout */
    reset: () => {
      if (typeof posthog === 'undefined') return
      posthog.reset()
    },
    /* Custom methods for PostHog-specific functionality */
    methods: {
      /**
       * Associate user with a group (e.g., company, team)
       * @link https://posthog.com/docs/product-analytics/group-analytics
       * @param {string} groupType - Type of group (e.g., 'company')
       * @param {string} groupKey - Unique group identifier
       * @param {object} [groupProperties] - Optional properties to set on the group
       */
      group(groupType, groupKey, groupProperties) {
        if (typeof posthog === 'undefined') return
        posthog.group(groupType, groupKey, groupProperties)
      },
      /**
       * Create an alias for the current user
       * @link https://posthog.com/docs/product-analytics/identify#alias-assigning-multiple-distinct-ids-to-the-same-user
       * @param {string} alias - The alias to assign
       */
      alias(alias) {
        if (typeof posthog === 'undefined') return
        posthog.alias(alias)
      },
      /**
       * Check if a feature flag is enabled
       * @link https://posthog.com/docs/feature-flags
       * @param {string} flagKey - The feature flag key
       * @return {boolean|undefined} Whether the flag is enabled
       */
      isFeatureEnabled(flagKey) {
        if (typeof posthog === 'undefined') return
        return posthog.isFeatureEnabled(flagKey)
      },
      /**
       * Get a feature flag value (supports multivariate flags)
       * @link https://posthog.com/docs/feature-flags
       * @param {string} flagKey - The feature flag key
       * @return {string|boolean|undefined} The flag value
       */
      getFeatureFlag(flagKey) {
        if (typeof posthog === 'undefined') return
        return posthog.getFeatureFlag(flagKey)
      },
      /**
       * Get a feature flag's JSON payload
       * @link https://posthog.com/docs/feature-flags
       * @param {string} flagKey - The feature flag key
       * @return {object|undefined} The flag payload
       */
      getFeatureFlagPayload(flagKey) {
        if (typeof posthog === 'undefined') return
        return posthog.getFeatureFlagPayload(flagKey)
      },
      /**
       * Reload feature flags from PostHog
       */
      reloadFeatureFlags() {
        if (typeof posthog === 'undefined') return
        posthog.reloadFeatureFlags()
      },
      /**
       * Register super properties that are sent with every event
       * @param {object} properties - Properties to register
       */
      register(properties) {
        if (typeof posthog === 'undefined') return
        posthog.register(properties)
      },
      /**
       * Opt user out of capturing
       */
      optOut() {
        if (typeof posthog === 'undefined') return
        posthog.opt_out_capturing()
      },
      /**
       * Opt user in to capturing
       */
      optIn() {
        if (typeof posthog === 'undefined') return
        posthog.opt_in_capturing()
      },
      /**
       * Get the underlying PostHog client instance
       * @return {object} The posthog-js instance
       */
      getClient() {
        return typeof posthog !== 'undefined' ? posthog : null
      },
    },
  }
}

export default posthogPlugin
