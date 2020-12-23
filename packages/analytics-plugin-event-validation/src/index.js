
const defaultConfig = {
  throwOnInvalid: false
}

/**
 * Event validation plugin
 * @link https://getanalytics.io/plugins/event-validation/
 * @param {object}  pluginConfig - Plugin settings
 * @param {string}  pluginConfig.context - Name of app event is in. Example 'api', 'app', 'site', 'cli'
 * @param {boolean} pluginConfig.objects - Objects events can effect
 * @param {boolean} [pluginConfig.throwOnInvalid] - Objects events can effect
 * @return {object} Analytics plugin
 * @example
 *
 * eventValidation({
 *   context: 'app',
 *   objects: ['sites', 'user', 'subscription']
 * })
 */
export default function eventValidationPlugin(pluginConfig = {}) {
  return {
    name: 'event-validation',
    config: {
      ...defaultConfig,
      ...pluginConfig
    },
    trackStart: ({ payload, config, abort }) => {
      if (!isValidEventName(payload.event, config)) {
        const msg = `invalid event name ${payload.event}`
        if (config.throwOnInvalid) {
          throw new Error(msg)
        }
        return abort(msg)
      }
    }
  }
}

function isValidEventName(event, config) {
  const validProject = [config.context] || []
  const validObjects = config.objects || []
  const invalid = formatError(event)
  const underscoreCount = contains(event, '_')
  if (underscoreCount !== 1) {
    return invalid(`Event must have single underscore. "${event}" contains ${underscoreCount}`)
  }
  const colonCount = contains(event, ':')
  if (colonCount !== 1) {
    return invalid(`Event must have single colon. "${event}" contains ${colonCount}`)
  }

  const matches = event.match(/([a-zA-Z]+):([a-zA-Z]+)_([a-zA-Z]+$)/)
  if (!matches) {
    return invalid('Event malformed')
  }
  const [ , context, object, action ] = matches
  // if missing any parts of event, exit;
  if (!context || !object || !action) {
    return invalid('Missing context, object, or action')
  }
  /* Validate project name */
  if (validProject.indexOf(context) === -1) {
    return invalid(`Invalid context "${context}". Must be 1 of ${JSON.stringify(validProject)}`)
  }
  /* Validate object */
  if (validObjects.indexOf(object) === -1) {
    return invalid(`Invalid object "${object}". Must be 1 of ${JSON.stringify(validObjects)}`)
  }
  return true
}

function contains(str, char) {
  const regex = new RegExp(char, 'g')
  return (str.match(regex) || []).length
}

function formatError(event) {
  return (msg) => {
    console.log(`> Invalid event "${event}"`)
    if (msg) console.log(msg)
    console.log(`> Formatting information:`)
    console.log(`Event must match pattern "context:objectName_actionName"`)
    console.log(`Event must be camelCased "camelCase:camelCase_camelCase"`)
    console.log(`Example: app:sites_deploySucceeded`)
    return false
  }
}
