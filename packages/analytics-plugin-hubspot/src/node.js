/**
 * Node side
 */

const config = {}

const name = 'hubspot'

const logMessage = () => {
  console.log(`${name} not available in node.js yet. Todo implement https://www.npmjs.com/package/hubspot`)
}

/* Export the integration */
function hubSpotPlugin(userConfig = {}) {
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
      /* TODO:
        hubspot.contacts.get(opts)
        hubspot.contacts.getByEmail(email)
        hubspot.contacts.getByEmailBatch(emails)
        hubspot.contacts.getById(id)
        hubspot.contacts.getByIdBatch(ids)
        hubspot.contacts.getByToken(utk)
        hubspot.contacts.update(id, data)
        hubspot.contacts.create(data)
      */
      logMessage()
    }
  }
}

export default hubSpotPlugin
