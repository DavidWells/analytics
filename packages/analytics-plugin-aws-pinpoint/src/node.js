/* import aws SDK for server side */
let awsPinpoint
if (!process.browser) {
  awsPinpoint = require('@aws-sdk/client-pinpoint')
}

/**
 * AWS Pinpoint analytics server side integration. Uses https://github.com/aws/aws-sdk-js module
 * @link https://docs.aws.amazon.com/pinpoint/latest/developerguide/
 * @param {object} pluginConfig - Plugin settings
 * @param {string} pluginConfig.pinpointAppId - AWS Pinpoint app Id for client side tracking
 * @param {function} pluginConfig.getCredentials - Async function to get AWS Cognito creds 
 * @param {string} [pluginConfig.pinpointRegion] - AWS Pinpoint region. Defaults to us-east-1
 * @param {string} [pluginConfig.appTitle] - The title of the app that's recording the event.
 * @param {string} [pluginConfig.appPackageName] - The name of the app package, such as com.example.my_app.
 * @param {string} [pluginConfig.appVersionCode] - The version number of the app, such as 3.2.0
 * @param {string} [pluginConfig.fips] - Use the AWS FIPS service endpoint for Pinpoint
 * @param {boolean} [pluginConfig.disableAnonymousTraffic] -  Disable anonymous events from firing
 * @return {object} Analytics plugin
 * @example
 *
 * awsPinpointPlugin({
 *   pinpointAppId: '938bebb1ae954e123133213160f2b3be4',
 *   getCredentials: () => Auth.currentCredentials(),
 * })
 */
function awsPinpointNode(pluginConfig = {}) {

}

export default function awsPinpointNode(pluginConfig) {
  return {
    name: 'aws-pinpoint',
    initialize: ({ config }) => {
      console.log('AWS pinpoint has no server implementation')
    }
  }
}
