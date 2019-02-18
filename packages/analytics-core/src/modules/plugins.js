// Integrations Reducer. Follows ducks pattern http://bit.ly/2DnERMc
import EVENTS from '../events'

const initialState = {}

const checkIfLoaded = (loaded) => {
  return Boolean(loaded())
}

export default function createReducer(getPlugins) {
  return function plugins(state = initialState, action) {
    let newState = {}
    if (action.type === 'initialize:aborted') {
      return state
    }
    if (/^registerPlugin:([^:]*)$/.test(action.type)) {
      const name = action.type.split(':')[1]
      const pluginInstance = getPlugins()[name]
      if (!pluginInstance) {
        return state
      }
      newState[name] = {
        enabled: true,
        initialized: false,
        loaded: Boolean(pluginInstance.loaded()),
        config: pluginInstance.config || {}
      }
      return { ...state, ...newState }
    }
    if (/^initialize:([^:]*)$/.test(action.type)) {
      const name = action.type.split(':')[1]
      const pluginInstance = getPlugins()[name]
      if (!pluginInstance) {
        return state
      }
      newState[action.name] = {
        ...state[action.name],
        ...{
          initialized: true,
          loaded: Boolean(pluginInstance.loaded())
        }
      }
      return { ...state, ...newState }
    }
    if (/^ready:([^:]*)$/.test(action.type)) {
      // @TODO name missing from this fix
      newState[action.name] = {
        ...state[action.name],
        ...{ loaded: true }
      }
      return { ...state, ...newState }
    }
    switch (action.type) {
      case EVENTS.pluginFailed:
        // console.log('PLUGIN_FAILED', action.name)
        // TODO clean up
        newState[action.name] = {
          ...state[action.name],
          ...{ loaded: false }
        }
        return { ...state, ...newState }
      case EVENTS.disablePlugin:
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
      case EVENTS.enablePlugin:
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
}

export const registerPlugin = (plugin) => {
  return {
    type: EVENTS.pluginRegister,
    plugin: plugin
  }
}

export const enablePlugin = (name, callback) => {
  return {
    type: EVENTS.enablePlugin,
    name: name,
    callback: callback
  }
}

export const disablePlugin = (name, callback) => {
  return {
    type: EVENTS.disablePlugin,
    name: name,
    callback: callback
  }
}
