// Integrations Reducer follows dux pattern
import EVENTS from '../events'

const initialState = {}

export default function integrations(state = initialState, action) {
  let newState = {}
  switch (action.type) {
    case EVENTS.INTEGRATION_INIT:
      // console.log('INTEGRATION_INIT', action.name)
      // console.log('action.integration', action.integration)
      newState[action.name] = {
        enabled: true,
        loaded: false, // script loaded = false
        config: action.integration.config
      }
      return { ...state, ...newState }
    case EVENTS.INTEGRATION_LOADED:
      // console.log('INTEGRATION_LOADED', action.name)
      // TODO clean up
      const loaded = {}
      loaded[action.name] = {
        ...state[action.name],
        ...{ loaded: true }
      }
      // console.log('LOADED OBJECT', loaded)
      return { ...state, ...loaded }
    case EVENTS.INTEGRATION_FAILED:
      // console.log('INTEGRATION_FAILED', action.name)
      // TODO clean up
      newState[action.name] = {
        ...state[action.name],
        ...{ loaded: false }
      }
      return { ...state, ...newState }
    case EVENTS.DISABLE_INTEGRATION:
      // handle array of integrations ['vanilla', 'google']
      if (Array.isArray(action.name)) {
        newState = action.name.reduce((acc, curr) => {
          acc[curr] = {
            ...state[curr],
            ...{ enabled: false }
          }
          return acc
        }, state)
        return {...state, ...newState}
      }
      newState[action.name] = {
        ...state[action.name],
        ...{ enabled: false }
      }
      return {...state, ...newState}
    case EVENTS.ENABLE_INTEGRATION:
      // handle array of integrations ['vanilla', 'google']
      if (Array.isArray(action.name)) {
        newState = action.name.reduce((acc, curr) => {
          acc[curr] = {
            ...state[curr],
            ...{ enabled: true }
          }
          return acc
        }, state)
        return {...state, ...newState}
      }
      newState[action.name] = {
        ...state[action.name],
        ...{ enabled: true }
      }
      return {...state, ...newState}
    default:
      return state
  }
}

export const registerIntegration = (integration) => {
  return {
    type: EVENTS.INTEGRATION_INIT,
    integration: integration
  }
}

export const enableIntegration = (name, callback) => {
  return {
    type: EVENTS.ENABLE_INTEGRATION,
    name: name,
    callback: callback
  }
}

export const disableIntegration = (name, callback) => {
  return {
    type: EVENTS.DISABLE_INTEGRATION,
    name: name,
    callback: callback
  }
}
