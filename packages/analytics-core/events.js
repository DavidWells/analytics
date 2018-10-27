// Core Analytic Events

export default {
  INITIALIZE: 'analyticsInit',
  HANDLE_PARAMS: 'params',
  SET_CAMPAIGN: 'campaign',

  /* Integration actions */
  INTEGRATION_INIT: 'integrationInit',
  INTEGRATION_LOADED: 'integrationLoaded',
  INTEGRATION_FAILED: 'integrationFailed',
  INTEGRATION_LOADED_NAME: (name) => `integrationLoaded:${name}`,
  INTEGRATION_FAILED_NAME: (name) => `integrationFailed:${name}`,
  // Todo finish this event
  INTEGRATION_ENABLED: 'integrationEnabled',
  INTEGRATION_DISABLE: 'integrationDisabled',
  ENABLE_INTEGRATION: 'enableIntegration',
  DISABLE_INTEGRATION: 'disableIntegration',

  READY: 'analyticsReady',
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
  IDENTIFY_ABORTED: 'identifyAborted' // 'identifyAborted' // TODO add this
}
