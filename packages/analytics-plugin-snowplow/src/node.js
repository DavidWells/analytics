/* import serverside SDK */
let snowplow, gotEmitter, tracker;
if (!process.browser) {
  snowplow = require('snowplow-tracker');
  gotEmitter = snowplow.gotEmitter;
  tracker = snowplow.tracker;
}

/**
 * Snowplow analytics server side integration. Uses https://github.com/snowplow/snowplow-nodejs-tracker
 * @link https://getanalytics.io/plugins/snowplow/
 * @link https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/node-js-tracker/
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
  const e = gotEmitter(
    pluginConfig.collectorUrl,
    pluginConfig.protocol.toLowerCase() || 'https',
    pluginConfig.port,
    pluginConfig.method.toLowerCase() || 'post',
    pluginConfig.bufferSize,
    pluginConfig.retries || 5,
    null,
    { 
      http: new http.Agent({ maxSockets: pluginConfig.maxSockets || 6 }),
      https: new https.Agent({ maxSockets: pluginConfig.maxSockets || 6 })
    }
  );
  const t = tracker([e], name, pluginConfig.appId, false);
  return {
    name: name,
    config: pluginConfig,
    /**
     * Snowplow page view event https://bit.ly/39wIcFX
     * @example
     *
     * // Track page
     * analytics.page();
     *
     * // or Track page view with additional entities
     * analytics.page({
     *   context: [{
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
      t.trackPageView(properties.url, properties.title, properties.referrer, properties.context || []);
    },
    /**
     * Snowplow track event https://bit.ly/2X01Y7M
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
     *   context: [{
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
     *   context: [{
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
        switch (event.toLowerCase()) {
          case 'selfdescribingevent':
          case 'unstructevent':
            t.trackUnstructEvent(
              {
                schema: properties.schema,
                data: properties.data,
              },
              properties.context,
              properties.tstamp
            );
            break;
          case 'screenview':
            t.trackScreenView(
              properties.name,
              properties.id,
              properties.context,
              properties.tstamp
            );
            break;
          case 'ecommercetransaction':
            t.trackEcommerceTransaction(
              properties.orderId,
              properties.affiliation,
              properties.totalValue,
              properties.taxValue,
              properties.shipping,
              properties.city,
              properties.state,
              properties.country,
              properties.currency,
              properties.context,
              properties.tstamp
            );
            break;
          case 'ecommercetransaction':
            t.trackEcommerceTransactionItem(
              properties.orderId,
              properties.sku,
              properties.name,
              properties.category,
              properties.price,
              properties.quantity,
              properties.currency,
              properties.context,
              properties.tstamp
            );
            break;
          case 'linkclick':
            t.trackLinkClick(
              properties.targetUrl,
              properties.elementId,
              properties.elementClasses,
              properties.elementTarget,
              properties.context,
              properties.tstamp
            );
            break;
          case 'adimpression':
            t.trackAdImpression(
              properties.impressionId,
              properties.costModel,
              properties.cost,
              properties.targetUrl,
              properties.bannerId,
              properties.zoneId,
              properties.advertisingId,
              properties.campaignId,
              properties.context,
              properties.tstamp
            );
            break;
          case 'adclick':
            t.trackAdClick(
              properties.targetUrl,
              properties.clickId,
              properties.costModel,
              properties.cost,
              properties.bannerId,
              properties.zoneId,
              properties.advertisingId,
              properties.campaignId,
              properties.context,
              properties.tstamp
            );
            break;
          case 'adconversion':
            t.trackAdConversion(
              properties.conversionId,
              properties.costModel,
              properties.cost,
              properties.category,
              properties.action,
              properties.property,
              properties.initialValue,
              properties.advertisingId,
              properties.campaignId,
              properties.campaignId,
              properties.context,
              properties.tstamp
            );
            break;
          case 'consentgranted':
            t.trackConsentGranted(
              properties.id,
              properties.version,
              properties.name,
              properties.description,
              properties.expiry,
              properties.context,
              properties.tstamp
            );
            break;
          case 'consentwithdrawn':
            t.trackConsentWithdrawn(
              properties.id,
              properties.version,
              properties.name,
              properties.description,
              properties.all,
              properties.context,
              properties.tstamp
            );
            break;
          case 'structevent':
          default:
            t.trackStructEvent(
              properties.category || 'All',
              event || properties.action,
              properties.label,
              properties.property,
              properties.value,
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
