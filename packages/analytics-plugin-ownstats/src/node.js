const https = require('https');

class OwnstatsClient {
  constructor (endpoint) {
    this.endpoint = endpoint;
    this.reqUrl = `https://${endpoint}/hello.gif`;
  }
  send () {
    const qs = [];
    // Build querystring
    for (var property in data) {
      if (data.hasOwnProperty(property)) {
        qs.push(`${property}=${encodeURIComponent(data[property].toString())}`);
      }
    }
    const url = `${this.reqUrl}?${qs.join('&')}`;
    // Send data
    https.get(url, (response) => {
      let responseData = '';
      response.on('data', (chunk) => {
        responseData += chunk;
      });
      response.on('end', () => {
        return true;
      });
    }).on("error", (err) => {
      throw new Error(err.message);
    });
  }
}

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
  // Initialize segment client
  const ownstatsConfig = {
    ...config,
    ...pluginConfig
  }
  const client = new OwnstatsClient(ownstatsConfig.endpoint);
  return {
    NAMESPACE: 'ownstats',
    config: ownstatsConfig,
    /* page view */
    page: ({ payload, config }) => {
      var data = { t: 'pv', u: url, hn: loc.hostname };
      client.send({
        properties: payload.properties
      })
    },
    /* track event */
    track: ({ payload, config }) => {
      let data = { t: 'track', ...payload }
      client.send(data);
    },
    /* identify user */
    identify: ({ payload }) => {
      // There's no identify implementation with Ownstats
      return true;
    }
  }
}
