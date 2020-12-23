/**
 * Node implementation
 */

let sdk
let client
if (!process.browser) {
  /* include your node side SDK */
  // sdk = require('analytics-node')
}

const config = {
  assumesPageview: true
}

/* Export the integration */
export default function analyticPlugin(userConfig) {
  // Allow for userland overides of base methods
  return {
    name: 'plugin-name',
    config: {
      ...config,
      ...userConfig
    },
    initialize: ({ config }) => {
      /* initialize client */
      client = sdk('xyz')
    },
    /* page view */
    page: ({ payload, config }) => {
      console.log('Run pageview in node')
      client.page()
    },
    /* track event */
    track: ({ payload, config }) => {
      console.log('track event in node')
      client.track()
    },
    /* identify user */
    identify: ({ payload }) => {
      console.log('identify user in node')
      client.identify()
    },
    /* Not needed in node */
    // loaded: () {}
  }
}
