import Analytics from 'analytics'

/* automatically prefix event names */
const prefixEventNames = {
  NAMESPACE: 'prefixer',
  trackStart: ({ payload, instance }) => {
    const { event } = payload
    const prefix = `${instance.getState('context.app')}:`
    const prefixedEvent = event.startsWith(prefix) ? event : `${prefix}${event}`
    return {
      ...payload,
      ...{
        event: prefixedEvent
      }
    }
  }
}

/* enrich telemetry payload */
const enrichTelemetryPayload = {
  NAMESPACE: 'enrich',
  trackStart: ({ payload, instance }) => {
    return {
      ...payload,
      ...{
        properties: Object.assign({}, payload.properties, {
          addedValue: true
        }),
      }
    }
  }
}

/* enrich telemetry payload */
const enrichPluginTwo = {
  NAMESPACE: 'enrich-plugin-two',
  'track:plugin-two': ({ payload, instance }) => {
    return {
      ...payload,
      ...{
        properties: Object.assign({}, payload.properties, {
          secondValue: true
        }),
      }
    }
  }
}


const pluginOne = {
  NAMESPACE: 'plugin-one',
  track: ({ payload, instance }) => {
    console.log('Track from plugin-one')
  }
}

const pluginTwo = {
  NAMESPACE: 'plugin-two',
  track: ({ payload, instance }) => {
    console.log('Track from plugin-two')
  }
}

/* initialize analytics and load plugins */
const analytics = Analytics({
  debug: true,
  app: 'yolo',
  plugins: [
    prefixEventNames,
    enrichTelemetryPayload,
    enrichPluginTwo,
    pluginOne,
    pluginTwo
  ]
})


analytics.on('trackStart:prefixer', ({ payload }) => {
  console.log('current value', payload)
})

/* export analytics for usage through the app */
export default analytics
