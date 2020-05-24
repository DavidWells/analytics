const https = require('https');

// configuration
const config = {
  endpoint: null
};

class OwnstatsClient {
  constructor (endpoint) {
    this.endpoint = endpoint;
    this.reqUrl = `https://${endpoint}/hello.gif`;
  }
  flatten (ob, prefix) {
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
  send () {
    const qs = [];
    // Flatten data
    const flattenedData = flatten(data);
    // Build querystring
    for (var property in flattenedData) {
      if (flattenedData.hasOwnProperty(property)) {
        qs.push(`${property}=${encodeURIComponent(flattenedData[property].toString())}`);
      }
    }
    const url = `${this.reqUrl}?${qs.join('&')}`;
    // Send data
    https.get(url, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
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
