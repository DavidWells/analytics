// Core Analytic Events

export default {
  INITIALIZE: 'analyticsInit',
  HANDLE_PARAMS: 'params',
  SET_CAMPAIGN: 'campaign',

  /* Integration actions */
  INTEGRATION_INIT: 'integrationInit',
  INTEGRATION_NAMESPACE: (name) => `integrationInit:${name}`,
  INTEGRATION_LOADED: 'integrationLoaded',
  INTEGRATION_FAILED: 'integrationFailed',
  INTEGRATION_LOADED_NAME: (name) => `integrationLoaded:${name}`,
  INTEGRATION_FAILED_NAME: (name) => `integrationFailed:${name}`,
  // Todo finish this event
  ENABLE_INTEGRATION: 'enableIntegration',
  INTEGRATION_ENABLED: 'integrationEnabled',
  DISABLE_INTEGRATION: 'disableIntegration',
  INTEGRATION_DISABLE: 'integrationDisabled',

  READY: 'analyticsReady',
  ONLINE: 'online',
  OFFLINE: 'offline',

  /* Page actions */
  PAGE_INIT: 'pageInit',
  PAGE: 'page',
  PAGE_NAMESPACE: (name) => `page:${name}`,
  PAGE_COMPLETE: 'pageCompleted',
  PAGE_ABORT: 'pageAborted',
  PAGE_TIME_OUT: 'pageTimedOut',

  /* Track actions */
  TRACK_INIT: 'trackInit',
  TRACK: 'track',
  TRACK_NAMESPACE: (name) => `track:${name}`,
  TRACK_COMPLETE: 'trackCompleted',
  TRACK_ABORT: 'trackAborted',
  TRACK_TIME_OUT: 'trackTimedOut',

  /* Identify actions */
  IDENTIFY_INIT: 'identifyInit',
  IDENTIFY: 'identify',
  IDENTIFY_NAMESPACE: (name) => `identify:${name}`,
  IDENTIFY_COMPLETE: 'identifyCompleted',
  IDENTIFY_ABORT: 'identifyAborted', // 'identifyAborted' // TODO add this
  IDENTIFY_TIME_OUT: 'identifyTimedOut',
  USER_ID_CHANGED: 'userIdChanged'
}
