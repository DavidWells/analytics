/**
 * Node side
 */

const config = {}

const NAMESPACE = 'mixpanel'

const logMessage = () => {
  console.log(`${NAMESPACE} not available in node.js yet. Todo implement https://github.com/mixpanel/mixpanel-node`)
}

/* Export the integration */
function mixpanelPlugin(userConfig = {}) {
  // Allow for userland overides of base methods
  return {
    NAMESPACE: NAMESPACE,
    config: {
      ...config,
      ...userConfig
    },
    initialize: ({ config }) => {
      logMessage()
    },
    // page view
    page: ({ payload, config }) => {
      logMessage()
    },
    // track event
    track: ({ payload, config }) => {
      logMessage()
    },
    // identify user
    identify: ({ payload }) => {
      logMessage()
    }
  }
}

export default mixpanelPlugin
