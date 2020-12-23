const https = require('https')

class OwnstatsClient {
  constructor (endpoint) {
    this.endpoint = endpoint
    this.reqUrl = `https://${endpoint}/hello.gif`
  }
  send () {
    const qs = []
    // Build querystring
    for (var property in data) {
      if (data.hasOwnProperty(property)) {
        qs.push(`${property}=${encodeURIComponent(data[property].toString())}`)
      }
    }
    const url = `${this.reqUrl}?${qs.join('&')}`
    // Send data
    https.get(url, (response) => {
      let responseData = ''
      response.on('data', (chunk) => {
        responseData += chunk
      })
      response.on('end', () => {
        return true
      })
    }).on("error", (err) => {
      throw new Error(err.message)
    })
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
function ownstatsPlugin(pluginConfig) {
  // Initialize segment client
  const ownstatsConfig = {
    ...pluginConfig
  }
  const client = new OwnstatsClient(ownstatsConfig.endpoint)
  return {
    name: 'ownstats',
    config: ownstatsConfig,
    /* page view */
    page: ({ payload }) => {
      let host
      // Derive host (with eventual port number)
      const hostWithPort = payload.properties.url
        .replace('https://', '')
        .replace('http://', '')
        .split('/')[0]
      // Derive host
      if (hostWithPort.split(':').length === 2) {
        host = hostWithPort.split(':')[0]
      } else {
        host = hostWithPort
      }
      const data = {
        t: 'pv',
        ts: payload.meta.timestamp,
        u: payload.properties.url,
        hn: host,
        pa: payload.properties.path,
        iw: payload.properties.width,
        ih: payload.properties.height,
        ti: payload.properties.title
      }
      client.send(data)
    }
  }
}

export default ownstatsPlugin
