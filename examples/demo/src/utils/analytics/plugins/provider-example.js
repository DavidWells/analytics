/**
 * Example Provider Plugin
 */

const defaultConfig = {
  assumesPageview: true
}

export default function exampleProviderPlugin(userConfig = {}) {
  return {
    NAMESPACE: 'analytics-tool-xyz',
    config: {
      ...defaultConfig,
      ...userConfig
    },
    initialize: ({ config }) => {
      console.log('Example initialize > ', config)
      // simulate a global variable loading
      window.providerExampleLoaded = true
    },
    page: ({ payload }) => {
      console.log(`Example Page > [payload: ${JSON.stringify(payload, null, 2)}]`)
    },
    /* Track event */
    track: ({ payload }) => {
      console.log(`Example Track > [${payload.event}] [payload: ${JSON.stringify(payload, null, 2)}]`)
    },
    /* Identify user */
    identify: ({ payload }) => {
      console.log(`Example identify > [payload: ${JSON.stringify(payload, null, 2)}]`)
    },
    loaded: () => {
      return !!window.providerExampleLoaded
    }
  }
}
