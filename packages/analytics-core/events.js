/**
 * Core Analytic Events
 */

const EVENTS = {
  /* Initial bootstrap event */
  INITIALIZE: 'analyticsInit',
  /* Handle URL parameters */
  PARAMS: 'params',
  /* Handle Campaign URL parameters */
  CAMPAIGN: 'campaign',
  /* After all analytics providers are loaded. Ready fires */
  READY: 'analyticsReady',
  /* Clear all user data */
  RESET: 'analyticsReset',
  /* Integration actions */
  PLUGIN_INIT: 'pluginInit',
  PLUGIN_INIT_TYPE: (name) => `pluginInit:${name}`,
  // Not in use PLUGIN_LOADED: 'integrationLoaded',
  // fired when 'loaded' timesout after 10 seconds
  PLUGIN_FAILED: 'pluginFailed',
  PLUGIN_LOADED_TYPE: (name) => `pluginReady:${name}`,
  PLUGIN_FAILED_TYPE: (name) => `pluginFailed:${name}`,

  // Todo finish this event
  ENABLE_PLUGIN: 'enablePlugin',
  // Not in use PLUGIN_ENABLED: 'integrationEnabled',
  DISABLE_PLUGIN: 'disablePlugin',
  // Not in use PLUGIN_DISABLE: 'integrationDisabled',

  /* Browser activity events */
  ONLINE: 'online',
  OFFLINE: 'offline',
  WINDOW_ENTER: 'windowEntered',
  WINDOW_LEAVE: 'windowLeft',
  TAB_HIDDEN: 'tabHidden',
  TAB_VISIBLE: 'tabVisible',

  /* Page actions */
  PAGE_INIT: 'pageInit',
  PAGE: 'page',
  PAGE_TYPE: (name) => `page:${name}`,
  PAGE_COMPLETE: 'pageCompleted',
  PAGE_ABORT: 'pageAborted',
  PAGE_TIME_OUT: 'pageTimedOut',

  /* Track actions */
  TRACK_INIT: 'trackInit',
  TRACK: 'track',
  TRACK_TYPE: (name) => `track:${name}`,
  TRACK_COMPLETE: 'trackCompleted',
  TRACK_ABORT: 'trackAborted',
  TRACK_TIME_OUT: 'trackTimedOut',

  /* Identify actions */
  IDENTIFY_INIT: 'identifyInit',
  IDENTIFY: 'identify',
  IDENTIFY_TYPE: (name) => `identify:${name}`,
  IDENTIFY_COMPLETE: 'identifyCompleted',
  IDENTIFY_ABORT: 'identifyAborted',
  IDENTIFY_TIME_OUT: 'identifyTimedOut',
  USER_ID_CHANGED: 'userIdChanged',

  /* storage actions */
  SET_ITEM: 'setItem',
  SET_ITEM_ABORT: 'setItemAborted',
  SET_ITEM_COMPLETE: 'setItemCompleted',
  REMOVE_ITEM: 'removeItem',
  REMOVE_ITEM_ABORT: 'removeItemAborted',
  REMOVE_ITEM_COMPLETE: 'removeItemCompleted',
}

export default EVENTS

export const reservedActions = Object.keys(EVENTS).reduce((acc, curr) => {
  if (typeof EVENTS[curr] === 'function') return acc
  return acc.concat(EVENTS[curr])
}, [])
