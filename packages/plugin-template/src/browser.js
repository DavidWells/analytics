/**
 * Browser implementation
 */

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
      console.log('Load browser scripts!')
    },
    /* page view */
    page: ({ payload, config }) => {
      console.log('Run pageview in browser')
    },
    /* track event */
    track: ({ payload, config }) => {
      console.log('track event in browser')
    },
    /* identify user */
    identify: ({ payload }) => {
      console.log('identify user in browser')
    },
    /* Verify script loaded */
    loaded: function() {
      return !!window.myWindowGlobal
    }
  }
}
