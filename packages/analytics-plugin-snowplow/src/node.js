/* import serverside SDK */
let http, https, snowplow, gotEmitter, tracker;

if (!process.browser) {
  http = require('http')
  https = require('https')
  snowplow = require('snowplow-tracker')
  gotEmitter = snowplow.gotEmitter
  tracker = snowplow.tracker
}

/**
 * Snowplow analytics server side integration
 * @link https://getanalytics.io/plugins/snowplow/
 * @link https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-trackers/node-js-tracker/
 * @param {object} pluginConfig - Plugin settings
 * @param {string} pluginConfig.collectorUrl - The URL to a Snowplow collector
 * @param {string} pluginConfig.appId - The appId to identify this application
 * @param {string} [pluginConfig.name] - The name to identify this instance of the tracker ('snowplow' default)
 * @param {string} [pluginConfig.protocol] - 'http' or 'https' ('https' default)
 * @param {string} [pluginConfig.port] - collector port (80 or 443 default)
 * @param {string} [pluginConfig.method] - The method to send events to collector, 'post' or 'get' ('post' default)
 * @param {string} [pluginConfig.bufferSize] - Only send events once n are buffered. Defaults to 1 for GET requests and 10 for POST requests.
 * @param {string} [pluginConfig.retries] - The number of times the tracker will try to resend an event. Defaults to 5.
 * @param {string} [pluginConfig.maxSockets] - Node.js agentOptions object to tune performance (6 default)
 * @param {string} [pluginConfig.platform] - Sets the platform https://bit.ly/302dSQy ('srv' default)
 * @param {object} [pluginConfig.screenResolution] - Sets device screen resolution if available
 * @param {number} [pluginConfig.screenResolution.width] - Positive Integer for screen width
 * @param {number} [pluginConfig.screenResolution.height] - Positive Integer for screen height
 * @param {object} [pluginConfig.viewport] - Sets device viewport if available
 * @param {number} [pluginConfig.viewport.width] - Positive Integer for viewport width
 * @param {number} [pluginConfig.viewport.height] - Positive Integer for viewprt height
 * @param {number} [pluginConfig.colorDepth] - Positive Integer, in bits per pixel
 * @param {string} [pluginConfig.timezone] - Set user’s timezone e.g. 'Europe/London'
 * @param {string} [pluginConfig.lang] - Ser user's lang e.globalThis. 'en'
 * @return {object} Analytics plugin
 *
 * @example
 *
 * snowplowPlugin({
 *   name: 'snowplow',
 *   collectorUrl: 'collector.mysite.com',
 *   appId: 'myApp'
 * })
 */
function snowplowPlugin(pluginConfig = {}) {
  if (!pluginConfig.collectorUrl) {
    throw new Error('snowplow collector url missing');
  }
  const name = pluginConfig.name || 'snowplow';
  const protocol = pluginConfig.protocol ? pluginConfig.protocol.toLowerCase() : 'https';
  const method = pluginConfig.method ? pluginConfig.method.toLowerCase() : 'post';
  const e = gotEmitter(
    pluginConfig.collectorUrl,
    protocol,
    pluginConfig.port,
    method,
    pluginConfig.bufferSize,
    pluginConfig.retries || 5,
    null,
    {
      http: new http.Agent({ maxSockets: pluginConfig.maxSockets || 6 }),
      https: new https.Agent({ maxSockets: pluginConfig.maxSockets || 6 }),
    }
  );
  const t = tracker([e], name, pluginConfig.appId, false);
  return {
    name: name,
    config: pluginConfig,
    /**
     * Snowplow page view event
     * @example
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
     *       url: 'https://snowplowanalytics.com/blog/2020/01/24/re-thinking-the-structure-of-event-data/',
     *       category: 'Data Insights',
     *       author: 'Cara Baestlein',
     *       datePublished: '2020-01-24'
     *     }
     *   }]
     * });
     */
    page: ({ payload }) => {
      const { properties } = payload;
      t.track(snowplow.buildPageView({pageUrl: properties.url, pageTitle: properties.title, referrer: properties.referrer}), properties.contexts);
    },
    /**
     * Snowplow track event
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
     * analytics.track('ScreenView', {
     *   name: 'Product Page',
     *   id: 'p-123',
     *   contexts: [{
     *     schema: 'iglu:com.acme/product/jsonschema/1-0-0',
     *     data: {
     *       id: 'f9cb6cb6-5ca8-47a6-9035-d9c6ac13029e',
     *       category: 'clothing',
     *       subCategory: 'socks',
     *       price: 3.99
     *     }
     *   }]
     * });
     *
     */
    track: ({ payload }) => {
      const { event, properties } = payload;
      if (properties) {
        if (properties.contexts && !properties.context) {
          properties.context = properties.contexts;
        }
        switch (event.toLowerCase()) {
          case 'selfdescribingevent':
          case 'unstructevent':
            t.track(
              snowplow.buildSelfDescribingEvent({
                event: properties,
              }),
              properties.context,
              properties.tstamp
            );
            break;
          case 'screenview':
            t.track(snowplow.buildScreenView(properties), properties.context, properties.tstamp);
            break;
          case 'ecommercetransaction':
            t.track(snowplow.buildEcommerceTransaction(properties), properties.context, properties.tstamp);
            break;
          case 'ecommercetransaction':
            t.track(snowplow.buildEcommerceTransactionItem(properties), properties.context, properties.tstamp);
            break;
          case 'linkclick':
            t.track(snowplow.buildLinkClick(properties), properties.context, properties.tstamp);
            break;
          case 'adimpression':
            t.track(snowplow.buildAdImpression(properties), properties.context, properties.tstamp);
            break;
          case 'adclick':
            t.track(snowplow.buildAdClick(properties), properties.context, properties.tstamp);
            break;
          case 'adconversion':
            t.track(snowplow.buildAdConversion(properties), properties.context, properties.tstamp);
            break;
          case 'consentgranted':
            t.track(snowplow.buildConsentGranted(properties), properties.context, properties.tstamp);
            break;
          case 'consentwithdrawn':
            t.track(snowplow.buildConsentWithdrawn(properties), properties.context, properties.tstamp);
            break;
          case 'structevent':
          default:
            t.track(
              snowplow.buildStructEvent({
                category: properties.category || 'All',
                action: event || properties.action,
                label: properties.label,
                property: properties.property,
                value: properties.value,
              }),
              properties.context
            );
            break;
        }
      }
    },
    /**
     * Set Snowplow user_id identifer with setUserId
     */
    identify: ({ payload }) => {
      const { userId } = payload;
      if (userId) {
        t.setUserId(userId);
      }
    },
  };
}

export default snowplowPlugin;
