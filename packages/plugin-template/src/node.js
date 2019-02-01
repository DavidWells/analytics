/**
 * Node side
 */

const config = {
  assumesPageview: true
}

/* Export the integration */
export default function analyticPlugin(userConfig) {
  // Allow for userland overides of base methods
  return {
    NAMESPACE: 'plugin-name',
    config: {
      ...config,
      ...userConfig
    },
    initialize: ({ config }) => {
      console.log('Not needed in node')
    },
    // page view
    page: ({ payload, config }) => {
      console.log('Run pageview in node')
    },
    // track event
    track: ({ payload, config }) => {
      console.log('track event in node')
    },
    // identify user
    identify: ({ payload }) => {
      console.log('identify user in node')
    },
    /* Not needed in node
    loaded: function() {
      return true
    }
    */
  }
}
