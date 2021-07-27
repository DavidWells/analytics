// Integrations Reducer. Follows ducks pattern http://bit.ly/2DnERMc
import EVENTS from '../events'

export default function createReducer(getPlugins) {
  return function plugins(state = {}, action) {
    let newState = {}
    if (action.type === 'initialize:aborted') {
      return state
    }
    if (/^registerPlugin:([^:]*)$/.test(action.type)) {
      const name = getNameFromEventType(action.type, 'registerPlugin')
      const plugin = getPlugins()[name]
      if (!plugin || !name) {
        return state
      }
      const isEnabled = action.enabled
      newState[name] = {
        enabled: isEnabled,
        /* if no initialization method. Set initialized true */
        initialized: (isEnabled) ? Boolean(!plugin.initialize) : false,
        /* If plugin enabled === false, set loaded to false, else check plugin.loaded function */
        loaded: (isEnabled) ? Boolean(plugin.loaded()) : false,
        config: plugin.config || {}
      }
      return { ...state, ...newState }
    }
    if (/^initialize:([^:]*)$/.test(action.type)) {
      const name = getNameFromEventType(action.type, EVENTS.initialize)
      const plugin = getPlugins()[name]
      if (!plugin || !name) {
        return state
      }
      newState[name] = {
        ...state[name],
        ...{
          initialized: true,
          /* check plugin.loaded function */
          loaded: Boolean(plugin.loaded())
        }
      }
      return { ...state, ...newState }
    }
    if (/^ready:([^:]*)$/.test(action.type)) {
      // const name = getNameFromEventType(action.type, 'ready')
      newState[action.name] = {
        ...state[action.name],
        ...{ loaded: true }
      }
      return { ...state, ...newState }
    }
    switch (action.type) {
      /* case EVENTS.pluginFailed:
        // console.log('PLUGIN_FAILED', action.name)
        newState[action.name] = {
          ...state[action.name],
          ...{ loaded: false }
        }
        return { ...state, ...newState }
      */
      /* When analytics.plugins.disable called */
      case EVENTS.disablePlugin:
        return { 
          ...state,
          ...togglePluginStatus(action.plugins, false, state)
        }
      /* When analytics.plugins.enable called */
      case EVENTS.enablePlugin:
        return {
          ...state, 
          ...togglePluginStatus(action.plugins, true, state)
        }
      default:
        return state
    }
  }
}

function getNameFromEventType(type, baseName) {
  return type.substring(baseName.length + 1, type.length)
}

function togglePluginStatus(plugins, status, currentState) {
  return plugins.reduce((acc, pluginKey) => {
    acc[pluginKey] = {
      ...currentState[pluginKey],
      ...{
        enabled: status 
      }
    }
    return acc
  }, currentState)
}
