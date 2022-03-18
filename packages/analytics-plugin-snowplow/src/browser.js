/* global snowplow */
import {
  clearGlobalContexts,
  clearUserData,
  enableActivityTracking,
  newTracker,
  setCustomUrl,
  setReferrerUrl,
  setUserId,
  trackPageView,
  addGlobalContexts,
  removeGlobalContexts,
  disableAnonymousTracking,
  enableAnonymousTracking,
  trackSelfDescribingEvent,
  trackStructEvent,
  addPlugin,
} from '@snowplow/browser-tracker';
import {
  AdTrackingPlugin,
  trackAdClick,
  trackAdConversion,
  trackAdImpression,
} from '@snowplow/browser-plugin-ad-tracking';
import { ClientHintsPlugin } from '@snowplow/browser-plugin-client-hints';
import {
  ConsentPlugin,
  enableGdprContext,
  trackConsentGranted,
  trackConsentWithdrawn,
} from '@snowplow/browser-plugin-consent';
import { EcommercePlugin, trackAddToCart, trackRemoveFromCart } from '@snowplow/browser-plugin-ecommerce';
import {
  addEnhancedEcommerceActionContext,
  addEnhancedEcommerceImpressionContext,
  addEnhancedEcommerceProductContext,
  addEnhancedEcommercePromoContext,
  EnhancedEcommercePlugin,
} from '@snowplow/browser-plugin-enhanced-ecommerce';
import { enableErrorTracking, ErrorTrackingPlugin, trackError } from '@snowplow/browser-plugin-error-tracking';
import { enableFormTracking, FormTrackingPlugin } from '@snowplow/browser-plugin-form-tracking';
import { GaCookiesPlugin } from '@snowplow/browser-plugin-ga-cookies';
import { GeolocationPlugin } from '@snowplow/browser-plugin-geolocation';
import {
  enableLinkClickTracking,
  LinkClickTrackingPlugin,
  refreshLinkClickTracking,
  trackLinkClick,
} from '@snowplow/browser-plugin-link-click-tracking';
import { OptimizelyXPlugin } from '@snowplow/browser-plugin-optimizely-x';
import { PerformanceTimingPlugin } from '@snowplow/browser-plugin-performance-timing';
import {
  SiteTrackingPlugin,
  trackSiteSearch,
  trackSocialInteraction,
  trackTiming,
} from '@snowplow/browser-plugin-site-tracking';
import { TimezonePlugin } from '@snowplow/browser-plugin-timezone';

const defaultConfig = {
  /* See description below */
  name: 'snowplow',
  trackerSettings: {  },
};

/**
 * Snowplow analytics integration
 * @link https://getanalytics.io/plugins/snowplow/
 * @link https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-trackers/browser-tracker/
 * @param {Object} pluginConfig - Plugin settings
 * @param {string} pluginConfig.collectorUrl - The URL to a Snowplow collector
 * @param {string} [pluginConfig.name] - The name to identify this instance of the tracker, use if using multiple tracker instances ('snowplow' default)
 * @param {Object} [pluginConfig.trackerSettings] - The arg map to pass to the Snowplow Tracker
 * @param {string} [pluginConfig.trackerSettings.appId] - The appId to identify this application
 * @param {string} [pluginConfig.trackerSettings.platform] - Platform of tracking ("web" default)
 * @param {string} [pluginConfig.trackerSettings.cookieDomain] - Domain to set cookie against
 * @param {string} [pluginConfig.trackerSettings.discoverRootDomain] - Automatically discover root domain
 * @param {string} [pluginConfig.trackerSettings.cookieName] - Prefix for cookies ("_sp_" default)
 * @param {string} [pluginConfig.trackerSettings.cookieSameSite] - SameSite cookie setting ("None" default)
 * @param {boolean} [pluginConfig.trackerSettings.cookieSecure] - Secure cookie setting (true default)
 * @param {boolean} [pluginConfig.trackerSettings.encodeBase64] - Encode JSON objects as Base64 (true default)
 * @param {bolean} [pluginConfig.trackerSettings.respectDoNotTrack] - Respect do not track (consider analytics-plugin-do-not-track) (false default)
 * @param {string} [pluginConfig.trackerSettings.eventMethod] - Method to send events, GET, POST, Beacon (POST default)
 * @param {number} [pluginConfig.trackerSettings.bufferSize] - Amount of events to buffer before sending (1 default)
 * @param {number} [pluginConfig.trackerSettings.maxPostBytes] - Maximum size of POST or Beacon before sending (40000 default)
 * @param {string} [pluginConfig.trackerSettings.crossDomainLinker] - function to configure which links to add cross domain linking
 * @param {number} [pluginConfig.trackerSettings.cookieLifetime] - Cookie lifetime (63072000 default)
 * @param {string} [pluginConfig.trackerSettings.stateStorageStrategy] - Use cookies and/or localstorage ("cookieAndLocalStorage" default)
 * @param {number} [pluginConfig.trackerSettings.maxLocalStorageQueueSize] - Maximum numbers of events to buffer in localstorage to prevent filling local storage (1000 default)
 * @param {boolean} [pluginConfig.trackerSettings.resetActivityTrackingOnPageView] - Flag to decide whether to reset page ping timers on virtual page view (true default)
 * @param {boolean} [pluginConfig.trackerSettings.connectionTimeout] - The timeout, in milliseconds, before GET and POST requests will timeout (5000 default) (Snowplow JS 2.15.0+)
 * @param {(Object|boolean)} [pluginConfig.trackerSettings.anonymousTracking] - Flag to enable anonymous tracking functionality (false default)
 * @param {boolean} [pluginConfig.trackerSettings.anonymousTracking.withSessionTracking] - Flag to enable whether to continue tracking sessions in anonymous tracking mode (false default)
 * @param {boolean} [pluginConfig.trackerSettings.anonymousTracking.withServerAnonymisation] - Flag which prevents collector from returning and capturing cookies and capturing ip address (false default)
 * @param {Object} [pluginConfig.trackerSettings.contexts] - The auto contexts for each event
 * @param {boolean} [pluginConfig.trackerSettings.contexts.webPage] - The webpage context, containing the page view id. (true default)
 * @param {boolean} [pluginConfig.trackerSettings.contexts.performanceTiming] - Add performance timing information
 * @param {(Object|boolean)} [pluginConfig.trackerSettings.contexts.clientHints] - Add Client Hint information (Snowplow JS 2.15.0+)
 * @param {boolean} [pluginConfig.trackerSettings.contexts.clientHints.includeHighEntropy] - Capture High Entropy Client Hints (Snowplow JS 2.15.0+)
 * @param {boolean} [pluginConfig.trackerSettings.contexts.gaCookies] - Add gaCookie information
 * @param {boolean} [pluginConfig.trackerSettings.contexts.geolocation] - Add browser geolocation information
 * @param {boolean} [pluginConfig.trackerSettings.contexts.optimizelyXSummary] - Add browser geolocation information
 * @param {Array} [pluginConfig.trackerSettings.plugins] - Additional plugins to include at tracker initialisation. See https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-trackers/browser-tracker/browser-tracker-v3-reference/plugins/
 * @return {Object} Analytics plugin
 *
 * @example
 * // Minimal recommended configuration
 * snowplowPlugin({
 *   name: 'snowplow',
 *   collectorUrl: 'collector.mysite.com',
 *   trackerSettings: {
 *     appId: 'myApp'
 *   }
 * })
 */
function snowplowPlugin(pluginConfig = {}) {
  let config = {
    ...defaultConfig,
    ...pluginConfig,
  };
  let loaded = false;

  return {
    name: config.name,
    config: config,
    initialize: () => {
      const { collectorUrl, name, trackerSettings } = config;
      if (!collectorUrl) {
        throw new Error('No collector url defined');
      }

      if (!trackerSettings.contexts) {
        trackerSettings.contexts = {};
      }

      trackerSettings.plugins = [
        ...trackerSettings.plugins || [],
        AdTrackingPlugin(),
        ConsentPlugin(),
        EcommercePlugin(),
        EnhancedEcommercePlugin(),
        ErrorTrackingPlugin(),
        FormTrackingPlugin(),
        LinkClickTrackingPlugin(),
        SiteTrackingPlugin(),
        TimezonePlugin(),
      ];

      if (trackerSettings.contexts.performanceTiming) {
        trackerSettings.plugins.push(PerformanceTimingPlugin());
      }
      if (trackerSettings.contexts.clientHints) {
        trackerSettings.plugins.push(
          ClientHintsPlugin(
            trackerSettings.contexts.clientHints === true
              ? false
              : trackerSettings.contexts.clientHints.includeHighEntropy
          )
        );
      }
      if (trackerSettings.contexts.gaCookies) {
        trackerSettings.plugins.push(GaCookiesPlugin());
      }
      if (trackerSettings.contexts.geolocation) {
        trackerSettings.plugins.push(GeolocationPlugin());
      }
      if (trackerSettings.contexts.optimizelyXSummary) {
        trackerSettings.plugins.push(OptimizelyXPlugin());
      }

      newTracker(name, collectorUrl, trackerSettings);

      loaded = true;
    },
    /**
     * Snowplow page view event https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-trackers/browser-tracker/browser-tracker-v3-reference/tracking-events/
     * @example
     *
     * // Enable some automatic tracking before page event
     * analytics.on('initialize:snowplow', ({instance}) => {
     *   instance.plugins.snowplow.enableActivityTracking(10,10);
     *   instance.plugins.snowplow.enableLinkClickTracking();
     * });
     *
     * // Track page
     * analytics.page();
     *
     * // or Track page view with additional entities
     * analytics.page({
     *   contexts: [{
     *     schema: 'iglu:com.acme/blog_post/jsonschema/1-0-0',
     *     data: {
     *       title: 'Re-thinking the structure of event data',
     *       category: 'Data Insights',
     *       author: 'Cara Baestlein',
     *       datePublished: '2020-01-24'
     *     }
     *   }]
     * });
     */
    page: ({ payload }) => {
      const { properties } = payload;
      const { name } = config;
      if (!loaded) return;

      // Use url and referrer values from Analaytics
      setCustomUrl(properties.url, [name]);
      setReferrerUrl(properties.referrer, [name]);

      // Track Page View event
      trackPageView(
        {
          title: properties.title,
          context: properties.contexts,
          dynamicContexts: properties.dynamicContexts,
        },
        [name]
      );
    },
    /**
     * Reset Snowplow domain_userid and all session information store in cookies and/or local storage
     * Also resets the user_id set with identify and setUserId
     * Also resets all global contexts
     */
    reset: () => {
      const { name } = config;
      if (!loaded) return;

      clearUserData({}, [name]);
      setUserId(undefined, [name]);
      clearGlobalContexts([name]);
    },
    /**
     * Snowplow track event https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-trackers/browser-tracker/browser-tracker-v3-reference/tracking-events/
     * All Snowplow 'track' and 'add' functions are available, remove 'track' or 'add' when calling analytics.track
     * i.e. analytics.track('adImpression', ..., ..., ...);
     * @example
     *
     * // Track structured event
     * analytics.track('playedVideo', {
     *   category: 'Videos',
     *   label: 'Fall Campaign',
     *   value: 42
     * })
     *
     * // or Track Self Describing event
     * analytics.track('selfDescribingEvent', {
     *   schema: 'iglu:com.acme/video_played/jsonschema/1-0-0',
     *   data: {
     *     id: 42,
     *     title: 'Fall Campaign'
     *   }
     * })
     *
     * // or Track Self Describing event with additional entities
     * analytics.track('selfDescribingEvent', {
     *   schema: 'iglu:com.acme/video_played/jsonschema/1-0-0',
     *   data: {
     *     id: 42,
     *     title: 'Fall Campaign',
     *     videoTimestampInMs: 1104
     *   },
     *   contexts: [{
     *     schema: 'iglu:com.acme/product/jsonschema/1-0-0',
     *     data: {
     *       id: 'f9cb6cb6-5ca8-47a6-9035-d9c6ac13029e',
     *       category: 'clothing',
     *       subCategory: 'socks',
     *       price: 3.99
     *     }
     *   }]
     * })
     *
     * // or Track Enchanced Ecommerce event with product context
     * analytics.track('EnhancedEcommerceProductContext', {
     *   id: 'P12345',
     *   name: 'Android Warhol T-Shirt',
     *   list: 'Search Results',
     *   brand: 'Google',
     *   category: 'Apparel/T-Shirts',
     *   variant: 'Black',
     *   quantity: 1
     * });
     * analytics.track('EnhancedEcommerceAction', {
     *   action: 'add'
     * });
     */
    track: ({ payload }) => {
      const { event, properties } = payload;
      const { name } = config;
      if (!loaded) return;

      track(name, event, properties);
    },
    /**
     * Set Snowplow user_id with setUserId
     * @example
     *
     * analytics.identify('user-id-xyz');
     */
    identify: ({ payload }) => {
      const { userId } = payload;
      const { name } = config;
      if (!loaded) return;

      if (userId) {
        setUserId(userId, [name]);
      }
    },
    loaded: () => {
      return loaded;
    },
    methods: {
      /**
       * Enables Activity Tracking
       * Generates page ping events based on user activity on page
       * Should be called before first page view event
       * @param {number} [minimumVisitLength] - Minimum visit length before first page ping event fires
       * @param {number} [heartbeat] - Period where user must be active to fire the next page ping
       */
      enableActivityTracking(minimumVisitLength, heartbeat) {
        const { name } = config;
        enableActivityTracking({ minimumVisitLength: minimumVisitLength, heartbeatDelay: heartbeat }, [name]);
      },
      /**
       * Refresh Link Click Tracking
       */
      refreshLinkClickTracking() {
        const { name } = config;
        refreshLinkClickTracking([name]);
      },
      /**
       * Allows for refreshing of form tracking
       * Use when forms are added to page
       * @param {Object} [formTrackingConfig] - Optional form tracking configuration
       * @param {string[]} [formTrackingConfig.blacklist] - An array of CSS classes which should be ignored by form tracking
       * @param {string[]} [formTrackingConfig.whitelist] - An array of the CSS classes of form elements which you do want to be tracked
       * @param {Object} [formTrackingConfig.fields] - An object that describes how to filter and transform form elements
       * @param {formFieldsFilter} [formTrackingConfig.fields.filter] - A function which determines which fields should be tracked. The function should take one argument, the form element, and return a boolean
       * @param {formFieldsTransform} [formTrackingConfig.fields.transform] - An array of CSS classes which should be ignored by link click tracking
       * @param {Context[]} [contexts] - Optional array of custom contexts to attach to every form track event
       */
      enableFormTracking(formTrackingConfig, contexts) {
        const { name } = config;
        enableFormTracking({ context: contexts, options: formTrackingConfig }, [name]);
      },
      /**
       * Adds the GDPR Context to all events
       * @param {string} [basisForProcessing] - Required. GDPR basis for data collection & processing
       * @param {string} [documentId] - ID for document detailing basis for processing
       * @param {string} [documentVersion] - Version of document detailing basis for processing
       * @param {string} [documentDescription] - Description of document detailing basis for processing
       */
      enableGdprContext(basisForProcessing, documentId, documentVersion, documentDescription) {
        const { name } = config;
        enableGdprContext({ basisForProcessing, documentId, documentVersion, documentDescription }, [name]);
      },
      /**
       * Enables automatic link click tracking
       * @param {Object} [filter] - An object to specify which links to include in tracking
       * @param {linkClickFilter} [filter.filter] - A function which determines which links should be tracked
       * @param {string[]} [filter.blacklist] - An array of CSS classes which should be ignored by link click tracking
       * @param {string[]} [filter.whitelist] - An array of the CSS classes of links which you do want to be tracked
       * @param {boolean} [pseudoClicks] - Allows middle clicks to track in Firefox. Can cause false positives. Recommended to enable.
       * @param {boolean} [content] - Set to true to capture the innerHTML of the clicked link
       * @param {Context[]} [contexts] - An array of custom contexts to attach to every link click event
       */
      enableLinkClickTracking(filter, pseudoClicks, content, contexts) {
        const { name } = config;
        enableLinkClickTracking({ options: filter, pseudoClicks, trackContent: content, context: contexts }, [name]);
      },
      /**
       * Enables automatic error tracking
       * @param {errorFilter} [filter] - A function which determines which ErrorEvents should be tracked.
       * @param {errorContexts} [contextAdder] - A function to build custom contexts
       */
      enableErrorTracking(filter, contextAdder) {
        const { name } = config;
        enableErrorTracking({ filter, contextAdder }, [name]);
      },
      /**
       * Allows contexts to be sent with every event, or a subset of events as defined in the ruleset
       * @param {GlobalContexts} globalContexts - Array of global contexts to be added to every event
       */
      addGlobalContexts(globalContexts) {
        const { name } = config;
        addGlobalContexts(globalContexts, [name]);
      },
      /**
       * Removes global contexts by matching on the schema name
       * @param {Context[]} globalContexts
       */
      removeGlobalContexts(globalContexts) {
        const { name } = config;
        removeGlobalContexts(globalContexts, [name]);
      },
      /**
       * Clears all Global Contexts
       */
      clearGlobalContexts() {
        const { name } = config;
        clearGlobalContexts([name]);
      },
      /**
       * Disables Anonymous Tracking
       * https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-trackers/browser-tracker/browser-tracker-v3-reference/tracker-setup/additional-options/
       * @param {string} stateStorageStrategy - Use to switch storage strategy, or don't use to leave the same
       */
      disableAnonymousTracking(stateStorageStrategy) {
        const { name } = config;
        disableAnonymousTracking({ stateStorageStrategy: stateStorageStrategy }, [name]);
      },
      /**
       * Enables Anonymous Tracking
       * https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-trackers/browser-tracker/browser-tracker-v3-reference/tracker-setup/additional-options/
       * @param {Object} anonymousTrackingArgs - Configures anonymous tracking features
       * @param {boolean} anonymousTrackingArgs.withSessionTracking - Enables session tracking when enabling Anonymous Tracking
       * @param {boolean} anonymousTrackingArgs.withServerAnonymisation - Prevents collector from returning cookies and capturing ip address
       * @param {string} stateStorageStrategy - Use to switch storage strategy, or don't use to leave the same
       */
      enableAnonymousTracking(anonymousTrackingArgs, stateStorageStrategy) {
        const { name } = config;
        enableAnonymousTracking({ options: anonymousTrackingArgs, stateStorageStrategy: stateStorageStrategy }, [name]);
      },
      /**
       * Adds a plugin to the available plugins
       * https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-trackers/javascript-tracker/javascript-tracker-v3/plugins/
       * @param {Object} plugin - The Plugin to include
       */

      addPlugin(plugin) {
        const { name } = config;
        addPlugin(plugin, [name]);
      }
    },
  };
}

export default snowplowPlugin;

function track(name, event, properties) {
  if (event && properties) {
    // Map V2 naming into V3 naming
    if (properties.contexts && !properties.context) {
      properties.context = properties.contexts;
    }

    switch (event.toLowerCase()) {
      case 'selfdescribingevent':
      case 'unstructevent':
        trackSelfDescribingEvent({ event: properties, context: properties.context }, [name]);
        break;
      case 'socialinteraction':
        trackSocialInteraction(properties, [name]);
        break;
      case 'adimpression':
        trackAdImpression(properties, [name]);
        break;
      case 'adclick':
        trackAdClick(properties, [name]);
        break;
      case 'adconversion':
        trackAdConversion(properties, [name]);
        break;
      case 'linkclick':
        trackLinkClick(properties, [name]);
        break;
      case 'addtocart':
        trackAddToCart(properties, [name]);
        break;
      case 'removefromcart':
        trackRemoveFromCart(properties, [name]);
        break;
      case 'sitesearch':
        trackSiteSearch(properties, [name]);
        break;
      case 'consentgranted':
        trackConsentGranted(properties, [name]);
        break;
      case 'consentwithdrawn':
        trackConsentWithdrawn(properties, [name]);
        break;
      case 'error':
        trackError(properties, [name]);
        break;
      case 'enhancedecommerceactioncontext':
        addEnhancedEcommerceActionContext(properties, [name]);
        break;
      case 'enhancedecommerceimpressioncontext':
        addEnhancedEcommerceImpressionContext(properties, [name]);
        break;
      case 'enhancedecommerceproductcontext':
        addEnhancedEcommerceProductContext(properties, [name]);
        break;
      case 'enhancedecommercepromocontext':
        addEnhancedEcommercePromoContext(properties, [name]);
        break;
      case 'enhancedecommerceaction':
        snowplow(`trackEnhancedEcommerceAction:${name}`, properties.action);
        break;
      case 'timing':
        trackTiming(properties, [name]);
      case 'structevent':
      default:
        trackStructEvent(
          {
            category: properties.category || 'All',
            action: event || properties.actions,
            label: properties.label,
            property: properties.property,
            value: properties.value,
            context: properties.context,
          },
          [name]
        );
        break;
    }
  }
}

/**
 * @typedef {Object} Context
 * @property {string} schema - The Schema which describes the context
 * @property {Object} data - The data object which conforms to the schema
 */

/**
 * A function which determines which links should be tracked
 * @callback linkClickFilter
 * @param {Object} element
 * @return {boolean} true if the element should be tracked
 */

/**
 * A function which determines which ErrorEvents should be tracked
 * @callback errorFilter
 * @param {Object} errorEvent
 * @return {boolean} true if the error should be tracked
 */

/**
 * A function which determines which ErrorEvents should be tracked
 * @callback errorContexts
 * @param {Object} errorEvent
 * @return {Context[]} Array of context to be included with the error tracking event
 */

/**
 * A function which determines which fields should be tracked
 * @callback formFieldsFilter
 * @param {Object} formElement
 * @return {boolean} true if the form field should be tracked
 */

/**
 * Transforms a form elements value
 * @callback formFieldsTransform
 * @param {Object} formElement
 * @return {string} The value to replace this form elements value with
 */

/**
 * @typedef {Object} GlobalContexts
 * @property {Context[]} contexts - The contexts to add
 * @property {GlobalContextFilter|GlobalContextRuleset} [filterConditions] - The Schema which describes the context
 */

/**
 * A function which determines which contexts should be sent
 * @callback GlobalContextFilter
 * @param {Object} event
 * @param {string} event.eventType This argument is a string taken from the event payload field, e. e.g. pv, pp, se
 * @param {string} event.eventSchema The schema of the event
 * @return {boolean} true if the context should be included with the event
 */

/**
 * @typedef {Object} GlobalContextRuleset
 * @property {string[]} [accept] - A list of schemas to attach this context to
 * @property {string[]} [reject] - A list of schemas to not attach this context too
 */
