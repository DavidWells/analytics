import Analytics from 'analytics'

// Case for https://github.com/DavidWells/analytics/issues/24

const pluginA = {
  name: 'pluginA',
  config: {
    test: 'A'
  },
  trackStart: ({ payload }) => {
    const enrichedProperties = Object.assign({}, payload.properties, {
      addOne: 'hello'
    })
    return {
      ...payload,
      ...{ properties: enrichedProperties }
    }
  }
}

const pluginB = {
  name: 'pluginB',
  config: {
    test: 'B'
  },
  trackStart: ({ payload }) => {
    const enrichedProperties = Object.assign({}, payload.properties, {
      addTwo: 'there'
    })
    return {
      ...payload,
      ...{ properties: enrichedProperties }
    }
  }
}

const pluginC = {
  name: 'pluginC',
  trackStart: ({ payload }) => {
    const enrichedProperties = Object.assign({}, payload.properties, {
      addThree: 'now'
    })
    return {
      ...payload,
      ...{ properties: enrichedProperties }
    }
  }
}

const pluginDWithTrack = {
  name: 'pluginD',
  track: ({ config, payload }) => {
    console.log('pluginD payload', payload)
    console.log('pluginD payload.properties', payload.properties)
  }
}

/* initialize analytics and load plugins */
const analytics = Analytics({
  debug: true,
  app: 'yolo',
  plugins: [
    pluginA,
    pluginB,
    pluginC,
    pluginDWithTrack
  ]
})

// analytics.storage.setItem('wer', 'hi', 'cookie')

window.Analytics = analytics

/* export analytics for usage through the app */
export default analytics
