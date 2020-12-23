/**
 * Node side
 */

const config = {}

const name = 'mixpanel'

const logMessage = () => {
  console.log(`${name} not available in node.js yet. Todo implement https://github.com/mixpanel/mixpanel-node`)
}

/* Export the integration */
function mixpanelPlugin(userConfig = {}) {
  // Allow for userland overides of base methods
  return {
    name: name,
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
