/**
 * Node side
 */

const config = {}

const name = 'livesession'

const logMessage = () => {
  console.log(`${name} not available in node.js yet. Todo implement https://github.com/livesession/livesession-node`)
}

/* Export the integration */
export default function livesessionPlugin(userConfig = {}) {
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
