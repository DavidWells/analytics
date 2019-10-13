/**
 * Node side
 */

const config = {}

const NAMESPACE = 'fullstory'

const logMessage = () => {
  console.log(`${NAMESPACE} not available in node.js yet. Todo implement https://www.npmjs.com/package/fullstory`)
}

/* Export the integration */
function fullStoryPlugin(userConfig = {}) {
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

export default fullStoryPlugin
