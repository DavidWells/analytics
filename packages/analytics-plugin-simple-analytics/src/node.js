/**
 * Node implementation
 */

const pluginName = 'simple-analytics'

const noOp = () => console.log(`No ${pluginName} node implementation`)

export default function simpleAnalyticsPlugin(userConfig) {
  // Allow for userland overides of base methods
  return {
    NAMESPACE: pluginName,
    config: {},
    initialize: noOp,
  }
}
