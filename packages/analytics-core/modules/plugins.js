// Integrations Reducer. Follows ducks pattern http://bit.ly/2DnERMc
import EVENTS from '../events'

const initialState = {}

export default function plugins(state = initialState, action) {
  let newState = {}
  if (/^pluginInit:/.test(action.type)) {
    newState[action.name] = {
      enabled: true,
      loaded: false, // script loaded = false
      config: action.integration.config || {}
    }
    return { ...state, ...newState }
  }
  if (/^pluginReady:/.test(action.type)) {
    newState[action.name] = {
      ...state[action.name],
      ...{ loaded: true }
    }
    // console.log('LOADED OBJECT', loaded)
    return { ...state, ...newState }
  }
  switch (action.type) {
    case EVENTS.PLUGIN_FAILED:
      // console.log('PLUGIN_FAILED', action.name)
      // TODO clean up
      newState[action.name] = {
        ...state[action.name],
        ...{ loaded: false }
      }
      return { ...state, ...newState }
    case EVENTS.DISABLE_PLUGIN:
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
    case EVENTS.ENABLE_PLUGIN:
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

export const registerPlugin = (plugin) => {
  return {
    type: EVENTS.PLUGIN_INIT,
    plugin: plugin
  }
}

export const enablePlugin = (name, callback) => {
  return {
    type: EVENTS.ENABLE_PLUGIN,
    name: name,
    callback: callback
  }
}

export const disablePlugin = (name, callback) => {
  return {
    type: EVENTS.DISABLE_PLUGIN,
    name: name,
    callback: callback
  }
}
