/**
 * Node side
 */

const config = {}

const NAMESPACE = 'google-tag-manager'

const logMessage = () => {
  console.log(`${NAMESPACE} not available in node.js. Please use the google analytics plugin instead`)
}

/* Export the integration */
export default function googleTagManager(userConfig) {
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
