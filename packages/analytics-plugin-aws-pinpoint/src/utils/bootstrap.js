export default function bootstrap(pluginApi) {
  const { config, instance } = pluginApi
  /* Load aws-pinpoint script after userId exists */
  if (config && config.disableAnonymousTraffic && !instance.user('userId')) {
    instance.once('identifyStart', ({ plugins }) => {
      const self = plugins['aws-pinpoint']
      if (!self.loaded()) {
        instance.loadPlugin('aws-pinpoint')
      }
    })
  } 
}
