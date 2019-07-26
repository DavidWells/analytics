/**
 * Node implementation
 */

const pluginName = 'simple-analytics'

/* Export the integration */
export default function analyticPlugin(userConfig) {
  // Allow for userland overides of base methods
  return {
    NAMESPACE: pluginName,
    config: {},
    initialize: ({ config }) => {
      console.log(`No ${pluginName} node implementation`)
    },
    /* page view */
    page: ({ payload, config }) => {
      console.log(`No ${pluginName} node implementation`)
    },
    /* track event */
    track: ({ payload, config }) => {
      console.log(`No ${pluginName} node implementation`)
    },
    /* identify user */
    identify: ({ payload }) => {
      console.log(`No ${pluginName} node implementation`)
    },
  }
}
