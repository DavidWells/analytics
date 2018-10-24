// Integrations Reducer
import EVENTS from '../events'

const initialState = {}

export default function integrations(state = initialState, action) {
  let newState = {}
  switch (action.type) {
    case EVENTS.REGISTER_INTEGRATION:
      // console.log('REGISTER_INTEGRATION', action.name)
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
        ...{loaded: true}
      }
      // console.log('LOADED OBJECT', loaded)
      return { ...state, ...loaded }
    case EVENTS.INTEGRATION_FAILED:
      // console.log('INTEGRATION_FAILED', action.name)
      // TODO clean up
      newState[action.name] = {
        ...state[action.name],
        ...{loaded: false}
      }
      return { ...state, ...newState }
    case EVENTS.DISABLE_INTEGRATION:
      // console.log('DISABLE_INTEGRATION', action.name)
      newState[action.name] = {
        ...state[action.name],
        ...{enabled: false}
      }
      return {...state, ...newState}
    default:
      return state
  }
}

export const registerIntegration = (integration) => {
  return {
    type: EVENTS.REGISTER_INTEGRATION,
    integration: integration
  }
}

export const enableIntegration = (name) => {
  return {
    type: EVENTS.ENABLE_INTEGRATION,
    name: name
  }
}

export const disableIntegration = (name) => {
  return {
    type: EVENTS.DISABLE_INTEGRATION,
    name: name
  }
}
