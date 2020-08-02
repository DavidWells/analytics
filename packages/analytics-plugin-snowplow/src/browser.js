/* global snowplow */

const defaultConfig = {
  /* See description below */
  name: 'snowplow',
  trackerSettings: {
    contexts: {
      webPage: true
    }
  }
}

let trackerInstances = {};

/**
 * Snowplow analytics integration
 * @link https://getanalytics.io/plugins/snowplow/
 * @link https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-tracker/
 * @param {Object} pluginConfig - Plugin settings
 * @param {string} pluginConfig.scriptSrc - Self-hosted Snowplow sp.js file location
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
 * @param {number} [pluginConfig.trackerSettings.pageUnloadTimer] - Timeout in ms to block page navigation until buffer is empty (500 default)
 * @param {boolean} [pluginConfig.trackerSettings.forceSecureTracker] - Forces requests to be sent https (false default)
 * @param {string} [pluginConfig.trackerSettings.eventMethod] - Method to send events, GET, POST, Beacon (POST default)
 * @param {number} [pluginConfig.trackerSettings.bufferSize] - Amount of events to buffer before sending (1 default)
 * @param {number} [pluginConfig.trackerSettings.maxPostBytes] - Maximum size of POST or Beacon before sending (40000 default)
 * @param {string} [pluginConfig.trackerSettings.crossDomainLinker] - function to configure which links to add cross domain linking
 * @param {number} [pluginConfig.trackerSettings.cookieLifetime] - Cookie lifetime (63072000 default)
 * @param {string} [pluginConfig.trackerSettings.stateStorageStrategy] - Use cookies and/or localstorage ("cookieAndLocalStorage" default)
 * @param {number} [pluginConfig.trackerSettings.maxLocalStorageQueueSize] - Maximum numbers of events to buffer in localstorage to prevent filling local storage (1000 default)
 * @param {boolean} [pluginConfig.trackerSettings.resetActivityTrackingOnPageView] - Flag to decide whether to reset page ping timers on virtual page view (true default)
 * @param {Object} [pluginConfig.trackerSettings.contexts] - The auto contexts for each event
 * @param {boolean} [pluginConfig.trackerSettings.contexts.webPage] - The webpage context, containing the page view id. (true default)
 * @param {boolean} [pluginConfig.trackerSettings.contexts.performanceTiming] - Add performance timing information
 * @param {boolean} [pluginConfig.trackerSettings.contexts.gaCookies] - Add gaCookie information
 * @param {boolean} [pluginConfig.trackerSettings.contexts.geolocation] - Add browser geolocation information
 * @param {boolean} [pluginConfig.trackerSettings.contexts.optimizelyXSummary] - Add browser geolocation information
 * @return {Object} Analytics plugin
 * 
 * @example
 *
 * // Minimal recommended configuration
 * snowplowPlugin({
 *   name: 'snowplow',
 *   scriptSrc: '//*.cloudfront.net/2.14.0/sp.js',
 *   collectorUrl: 'collector.mysite.com',
 *   trackerSettings: {
 *     appId: 'myApp',
 *     contexts: {
 *       webPage: true
 *     }
 *   }
 * })
 */
function snowplowPlugin(pluginConfig = {}) {
  let config = {
    ...defaultConfig,
    ...pluginConfig,
  };
  return {
    NAMESPACE: config.name,
    initialize: () => {
      const { scriptSrc, collectorUrl, name, trackerSettings } = config;
      if (!scriptSrc) {
        throw new Error('No Snowplow sp.js location defined');
      }
      if (!collectorUrl) {
        throw new Error('No collector url defined');
      }
      /* eslint-disable */
      (function(p,l,o,w,i,n,g){if(!p[i]){p.GlobalSnowplowNamespace=p.GlobalSnowplowNamespace||[];
        p.GlobalSnowplowNamespace.push(i);p[i]=function(){(p[i].q=p[i].q||[]).push(arguments)
        };p[i].q=p[i].q||[];n=l.createElement(o);g=l.getElementsByTagName(o)[0];n.async=1;
        n.src=w;g.parentNode.insertBefore(n,g)}}(window,document,'script',scriptSrc,'snowplow'));
      /* eslint-enable */
      
      snowplow(
        'newTracker', 
        name, 
        collectorUrl, 
        trackerSettings
      );

      snowplow(function() {
        var tracker = this[name];
        trackerInstances[name] = {
          idCookieName: tracker.getCookieName('id'),
          sesCookieName: tracker.getCookieName('ses'),
        };
      });
    },
    /**
     * Snowplow page view event https://bit.ly/36Qvz7t
     * @example
     * 
     * // Enable some automatic tracking before page event
     * analytics.on('initialize:snowplow', ({instance}) => {
     *   instance.plugins.snowplow.enableActivityTracking(10,10);
     *   instance.plugins.snowplow.enableLinkClickTracking();
     * });
     * 
     * //Track page
     * analytics.page();
     * 
     * //or Track page view with additional entities
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
      if (snowplowNotLoaded()) return;
      
      // Use url and referrer values from Analaytics
      snowplow(
        `setCustomUrl:${name}`, 
        properties.url
      );
      snowplow(
        `setReferrerUrl:${name}`,
        properties.referrer
      );

      // Track Page View event
      snowplow(
        `trackPageView:${name}`, 
        properties.title, 
        properties.contexts, 
        properties.dynamicContexts
      );
    },
    /**
     * Reset Snowplow domain_userid and all session information store in cookies and/or local storage
     * Also resets the user_id set with identify and setUserId
     * Also resets all global contexts
     */
    reset: ({ instance }) => {
      const { name, trackerSettings } = config;
      if (snowplowNotLoaded()) return;

      let opts = { storage: 'cookie' };

      if (trackerSettings && trackerSettings.stateStorageStrategy === 'localStorage') {
        opts = { storage: 'localStorage' };
      }

      instance.storage.removeItem(trackerInstances[name].idCookieName, opts);
      instance.storage.removeItem(trackerInstances[name].sesCookieName, opts);

      snowplow(
        `setUserId:${name}`, 
        undefined
      );

      snowplow(
        `clearGlobalContexts:${name}`
      );
    },
    /**
     * Snowplow track event https://bit.ly/2yRKH8c
     * All Snowplow 'track' and 'add' functions are available, remove 'track' or 'add' when calling analytics.track
     * i.e. analytics.track('adImpression', ..., ..., ...);
     * @example
     *
     * //Track structured event
     * analytics.track('playedVideo', {
     *   category: 'Videos',
     *   label: 'Fall Campaign',
     *   value: 42
     * })
     * 
     * //or Track Self Describing event
     * analytics.track('selfDescribingEvent', {
     *   schema: 'iglu:com.acme/video_played/jsonschema/1-0-0',
     *   data: {
     *     id: 42,
     *     title: 'Fall Campaign'
     *   }
     * })
     * 
     * //or Track Self Describing event with additional entities
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
     * //or Track Enchanced Ecommerce event with product context
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
      if (snowplowNotLoaded()) return;

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
      if (snowplowNotLoaded()) return;

      if (userId) {
        snowplow(
          `setUserId:${name}`, 
          userId
        );
      }
    },
    loaded: () => {
      return !snowplowNotLoaded();
    },
    methods: {
      /**
       * Enables Activity Tracking https://bit.ly/3hBM6QK
       * Generates page ping events based on user activity on page
       * Should be called before first page view event
       * @param {number} [minimumVisitLength] - Minimum visit length before first page ping event fires
       * @param {number} [heartbeat] - Period where user must be active to fire the next page ping
       */
      enableActivityTracking(minimumVisitLength, heartbeat) {
        const { name } = config;
        snowplow(
          `enableActivityTracking:${name}`, 
          minimumVisitLength, 
          heartbeat
        );
      },
      /**
       * Refresh Link Click Tracking https://bit.ly/2D7MgjQ
       */
      refreshLinkClickTracking() {
        const { name } = config;
        snowplow(
          `refreshLinkClickTracking:${name}`
        );
      },
      /**
       * Allows for refreshing of form tracking https://bit.ly/2D7MgjQ
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
        snowplow(
          `enableFormTracking:${name}`, 
          formTrackingConfig || {}, 
          contexts || null
        );
      },
      /**
       * Adds the GDPR Context to all events https://bit.ly/3jHM0sE
       * @param {string} [basisForProcessing] - Required. GDPR basis for data collection & processing
       * @param {string} [documentId] - ID for document detailing basis for processing
       * @param {string} [documentVersion] - Version of document detailing basis for processing
       * @param {string} [documentDescription] - Description of document detailing basis for processing
       */
      enableGdprContext(basisForProcessing, documentId, documentVersion, documentDescription) {
        const { name } = config;
        snowplow(
          `enableGdprContext:${name}`,
          basisForProcessing,
          documentId || null,
          documentVersion || null,
          documentDescription || null
        );
      },
      /**
       * Enables automatic link click tracking https://bit.ly/300GXM4
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
        snowplow(
          `enableLinkClickTracking:${name}`,
          filter || {},
          pseudoClicks || true,
          content || false,
          contexts || null
        );
      },
      /**
       * Enables automatic error tracking https://bit.ly/3g2hEyP
       * @param {errorFilter} [filter] - A function which determines which ErrorEvents should be tracked.
       * @param {errorContexts} [contextAdder] - A function to build custom contexts
       */
      enableErrorTracking(filter, contextAdder) {
        const { name } = config;
        snowplow(
          `enableErrorTracking:${name}`, 
          filter || null, 
          contextAdder || null
        );
      },
      /**
       * Allows contexts to be sent with every event, or a subset of events as defined in the ruleset
       * https://bit.ly/3fj34Ca
       * @param {GlobalContexts} globalContexts - Array of global contexts to be added to every event
       */
      addGlobalContexts(globalContexts) {
        const { name } = config;

        let parameter = globalContexts.contexts;
        if (globalContexts.filterConditions) {
          parameter = [globalContexts.filterConditions, parameter];
        }

        snowplow(
          `addGlobalContexts:${name}`,
          parameter
        );
      },
      /**
       * Removes global contexts by matching on the schema name
       * @param {Context[]} globalContexts 
       */
      removeGlobalContexts(globalContexts) {
        const { name } = config;

        snowplow(
          `removeGlobalContexts:${name}`,
          globalContexts
        );
      },
      /**
       * Clears all Global Contexts
       */
      clearGlobalContexts() {
        const { name } = config;

        snowplow(
          `clearGlobalContexts:${name}`
        );
      }
    },
  };
}

export default snowplowPlugin

function snowplowNotLoaded() {
  return !window.snowplow;
}

function track(name, event, properties) {
  if (event && properties) {
    switch (event.toLowerCase()) {
      case 'selfdescribingevent':
      case 'unstructevent':
        snowplow(
          `trackSelfDescribingEvent:${name}`,
          {
            schema: properties.schema,
            data: properties.data
          }, 
          properties.contexts
        );
        break;
      case 'socialinteraction':
        snowplow(
          `trackSocialInteraction:${name}`,
          properties.action,
          properties.network,
          properties.target,
          properties.contexts
        );
        break;
      case 'adimpression':
        snowplow(
          `trackAdImpression:${name}`,
          properties.impressionId,
          properties.costModel, // 'cpa', 'cpc', or 'cpm'
          properties.cost, 
          properties.targetUrl,
          properties.bannerId,
          properties.zoneId,
          properties.advertiserId,
          properties.campaignId,
          properties.contexts
        );
        break;
      case 'adclick':
        snowplow(
          `trackAdClick:${name}`,
          properties.targetUrl,
          properties.clickId,
          properties.costModel,
          properties.cost,
          properties.bannerId,
          properties.zoneId,
          properties.impressionId, // the same as in trackAdImpression
          properties.advertiserId,
          properties.campaignId,
          properties.contexts
        );
        break;
      case 'adconversion':
        snowplow(
          `trackAdConversion:${name}`,
          properties.conversionId,
          properties.cost,
          properties.category,
          properties.action,
          properties.property,
          properties.initialValue, // how much the conversion is initially worth
          properties.advertiserId,
          properties.costModel,
          properties.campaignId,
          properties.contexts
        );
        break;
      case 'linkclick':
        snowplow(
          `trackLinkClick:${name}`,
          properties.targetUrl,
          properties.elementId,
          properties.elementClasses,
          properties.elementTarget,
          properties.elementContent,
          properties.contexts
        );
        break;
      case 'addtocart':
        snowplow(
          `trackAddToCart:${name}`,
          properties.sku,
          properties.name,
          properties.category,
          properties.unitPrice,
          properties.quantity,
          properties.currency,
          properties.contexts
        );
        break;
      case 'removefromcart':
        snowplow(
          `trackRemoveToCart:${name}`,
          properties.sku,
          properties.name,
          properties.category,
          properties.unitPrice,
          properties.quantity,
          properties.currency,
          properties.contexts
        );
        break;
      case 'sitesearch':
        snowplow(
          `trackSiteSearch:${name}`,
          properties.searchTerms,
          properties.filters,
          properties.resultsFound,
          properties.resultsDisplayed,
          properties.contexts
        );
        break;
      case 'consentgranted':
        snowplow(
          `trackConsentGranted:${name}`,
          properties.id,
          properties.version,
          properties.name,
          properties.description, 
          properties.expiry,
          properties.contexts
        );
        break;
      case 'consentwithdrawn':
        snowplow(
          `trackConsentWithdrawn:${name}`,
          properties.all,
          properties.id,
          properties.version,
          properties.name,
          properties.description, 
          properties.contexts
        );
        break;
      case 'error':
        snowplow(
          `trackError:${name}`,
          properties.message,
          properties.filename,
          properties.lineno,
          properties.colno,
          properties.error, 
          properties.contexts
        );
        break;
      case 'enhancedecommerceactioncontext':
        snowplow(
          `addEnhancedEcommerceActionContext:${name}`,
          properties.id,
          properties.affiliation,
          properties.revenue,
          properties.tax,
          properties.shipping,
          properties.coupon,
          properties.list,
          properties.step,
          properties.option,
          properties.currency
        );
        break;
      case 'enhancedecommerceimpressioncontext':
        snowplow(
          `addEnhancedEcommerceImpressionContext:${name}`,
          properties.id,
          properties.name,
          properties.list,
          properties.brand,
          properties.category,
          properties.variant,
          properties.position,
          properties.price,
          properties.currency
        );
        break;
      case 'enhancedecommerceproductcontext':
        snowplow(
          `addEnhancedEcommerceProductContext:${name}`,
          properties.id,
          properties.name,
          properties.list,
          properties.brand,
          properties.category,
          properties.variant,
          properties.price,
          properties.quantity,
          properties.coupon,
          properties.position,
          properties.currency
        );
        break;
      case 'enhancedecommercepromocontext':
        snowplow(
          `addEnhancedEcommercePromoContext:${name}`,
          properties.id,
          properties.name,
          properties.creative,
          properties.position,
          properties.currency
        );
        break;
      case 'enhancedecommerceaction':
        snowplow(
          `trackEnhancedEcommerceAction:${name}`, 
          properties.action
        );
        break;
      case 'timing':
        snowplow(
          `trackTiming:${name}`,
          properties.category,
          properties.variable,
          properties.timing,
          properties.label,
          properties.contexts
        );
      case 'structevent':
      default:
        snowplow(
          `trackStructEvent:${name}`,
          properties.category || 'All',
          event || properties.action,
          properties.label,
          properties.property,
          properties.value,
          properties.contexts
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
 * @return {Context[]} Array of contexts to be included with the error tracking event
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